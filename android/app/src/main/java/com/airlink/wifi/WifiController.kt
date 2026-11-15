package com.airlink.wifi

import android.annotation.SuppressLint
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.net.wifi.ScanResult
import android.net.wifi.WifiInfo
import android.net.wifi.WifiManager
import android.net.wifi.WifiNetworkSpecifier
import android.os.Build
import java.net.Inet4Address

class WifiController(private val context: Context) {

    private val wifiManager =
        context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
    private val connectivityManager =
        context.applicationContext.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager

    private var scanReceiver: BroadcastReceiver? = null
    private var activeNetworkCallback: ConnectivityManager.NetworkCallback? = null

    fun isWifiEnabled(): Boolean = wifiManager.isWifiEnabled

    @SuppressLint("MissingPermission")
    fun startScan(
        onScanCompleted: (List<WifiAccessPoint>, Boolean) -> Unit
    ) {
        unregisterScanReceiver()

        val receiver = object : BroadcastReceiver() {
            override fun onReceive(ctx: Context, intent: Intent) {
                val success = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    intent.getBooleanExtra(WifiManager.EXTRA_RESULTS_UPDATED, false)
                } else {
                    true
                }
                val results = readCurrentScanResults()
                onScanCompleted(results, success)
                unregisterScanReceiver()
            }
        }

        scanReceiver = receiver
        val filter = IntentFilter(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            context.registerReceiver(receiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            context.registerReceiver(receiver, filter)
        }

        @Suppress("DEPRECATION")
        val started = wifiManager.startScan()
        if (!started) {
            // Android throttles background/frequent scans; return cached scan results immediately
            onScanCompleted(readCurrentScanResults(), false)
        }
    }

    @SuppressLint("MissingPermission")
    fun readCurrentScanResults(): List<WifiAccessPoint> {
        val rawResults: List<ScanResult> = wifiManager.scanResults ?: emptyList()

        return rawResults
            .filter { result ->
                val name = getResultSsid(result)
                name.isNotBlank()
            }
            .groupBy { getResultSsid(it) }
            .mapNotNull { (ssid, group) ->
                val strongest = group.maxByOrNull { it.level } ?: return@mapNotNull null
                val rssi = strongest.level
                WifiAccessPoint(
                    ssid = ssid,
                    bssid = strongest.BSSID ?: "00:00:00:00:00:00",
                    rssiDbm = rssi,
                    frequencyMhz = strongest.frequency,
                    security = parseSecurity(strongest.capabilities),
                    signalPercent = rssiToPercent(rssi),
                    signalLevelBars = calculateBars(rssi)
                )
            }
            .sortedByDescending { it.rssiDbm }
    }

    @SuppressLint("MissingPermission")
    fun connectToNetwork(
        network: WifiAccessPoint,
        password: String,
        onConnected: (ConnectedWifiInfo) -> Unit,
        onFailure: (String) -> Unit
    ) {
        disconnect()

        val specifierBuilder = WifiNetworkSpecifier.Builder()
            .setSsid(network.ssid)

        when (network.security) {
            WifiSecurity.WPA3 -> specifierBuilder.setWpa3Passphrase(password)
            WifiSecurity.WPA2 -> specifierBuilder.setWpa2Passphrase(password)
            WifiSecurity.WEP -> {
                onFailure("WEP is deprecated on modern Android devices.")
                return
            }
            WifiSecurity.OPEN -> Unit
        }

        val request = NetworkRequest.Builder()
            .addTransportType(NetworkCapabilities.TRANSPORT_WIFI)
            .removeCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .setNetworkSpecifier(specifierBuilder.build())
            .build()

        val callback = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            object : ConnectivityManager.NetworkCallback(FLAG_INCLUDE_LOCATION_INFO) {
                override fun onAvailable(net: Network) {
                    connectivityManager.bindProcessToNetwork(net)
                    val info = extractConnectedInfo(net, network)
                    onConnected(info)
                }

                override fun onCapabilitiesChanged(
                    net: Network,
                    capabilities: NetworkCapabilities
                ) {
                    val wifiInfo = capabilities.transportInfo as? WifiInfo
                    if (wifiInfo != null) {
                        onConnected(buildConnectedInfoFromWifiInfo(wifiInfo, net))
                    }
                }

                override fun onUnavailable() {
                    onFailure("Authentication failed or connection request was cancelled.")
                }

                override fun onLost(net: Network) {
                    connectivityManager.bindProcessToNetwork(null)
                    onFailure("Wi-Fi connection lost.")
                }
            }
        } else {
            object : ConnectivityManager.NetworkCallback() {
                override fun onAvailable(net: Network) {
                    connectivityManager.bindProcessToNetwork(net)
                    val info = extractConnectedInfo(net, network)
                    onConnected(info)
                }

                override fun onUnavailable() {
                    onFailure("Authentication failed or connection request was cancelled.")
                }

                override fun onLost(net: Network) {
                    connectivityManager.bindProcessToNetwork(null)
                    onFailure("Wi-Fi connection lost.")
                }
            }
        }

        activeNetworkCallback = callback
        connectivityManager.requestNetwork(request, callback)
    }

    @SuppressLint("MissingPermission")
    fun readLiveConnectedSignal(): ConnectedWifiInfo? {
        val activeNetwork = connectivityManager.activeNetwork ?: return null
        val caps = connectivityManager.getNetworkCapabilities(activeNetwork) ?: return null
        if (!caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)) return null

        val wifiInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            caps.transportInfo as? WifiInfo ?: wifiManager.connectionInfo
        } else {
            @Suppress("DEPRECATION")
            wifiManager.connectionInfo
        } ?: return null

        return buildConnectedInfoFromWifiInfo(wifiInfo, activeNetwork)
    }

    fun disconnect() {
        activeNetworkCallback?.let { cb ->
            runCatching { connectivityManager.unregisterNetworkCallback(cb) }
        }
        activeNetworkCallback = null
        connectivityManager.bindProcessToNetwork(null)
    }

    fun cleanup() {
        unregisterScanReceiver()
        disconnect()
    }

    private fun unregisterScanReceiver() {
        scanReceiver?.let { receiver ->
            runCatching { context.unregisterReceiver(receiver) }
        }
        scanReceiver = null
    }

    @SuppressLint("MissingPermission")
    private fun extractConnectedInfo(net: Network, fallback: WifiAccessPoint): ConnectedWifiInfo {
        val caps = connectivityManager.getNetworkCapabilities(net)
        val wifiInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            caps?.transportInfo as? WifiInfo
        } else {
            null
        }
        return if (wifiInfo != null) {
            buildConnectedInfoFromWifiInfo(wifiInfo, net)
        } else {
            ConnectedWifiInfo(
                ssid = fallback.ssid,
                bssid = fallback.bssid,
                rssiDbm = fallback.rssiDbm,
                signalPercent = fallback.signalPercent,
                signalLevelBars = fallback.signalLevelBars,
                quality = rssiToQuality(fallback.rssiDbm),
                linkSpeedMbps = 0,
                frequencyMhz = fallback.frequencyMhz,
                ipAddress = readIpv4Address(net)
            )
        }
    }

    private fun buildConnectedInfoFromWifiInfo(wifiInfo: WifiInfo, net: Network): ConnectedWifiInfo {
        val cleanSsid = wifiInfo.ssid?.removePrefix("\"")?.removeSuffix("\"") ?: "<unknown>"
        val rssi = wifiInfo.rssi
        return ConnectedWifiInfo(
            ssid = cleanSsid,
            bssid = wifiInfo.bssid ?: "00:00:00:00:00:00",
            rssiDbm = rssi,
            signalPercent = rssiToPercent(rssi),
            signalLevelBars = calculateBars(rssi),
            quality = rssiToQuality(rssi),
            linkSpeedMbps = wifiInfo.linkSpeed,
            frequencyMhz = wifiInfo.frequency,
            ipAddress = readIpv4Address(net)
        )
    }

    private fun readIpv4Address(net: Network): String {
        val linkProps = connectivityManager.getLinkProperties(net) ?: return "Assigning..."
        val ipv4 = linkProps.linkAddresses.firstOrNull { it.address is Inet4Address }
        return ipv4?.address?.hostAddress ?: "Assigning..."
    }

    private fun getResultSsid(result: ScanResult): String {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            result.wifiSsid?.toString()?.removePrefix("\"")?.removeSuffix("\"") ?: ""
        } else {
            @Suppress("DEPRECATION")
            result.SSID ?: ""
        }
    }

    private fun parseSecurity(capabilities: String): WifiSecurity = when {
        capabilities.contains("SAE", ignoreCase = true) -> WifiSecurity.WPA3
        capabilities.contains("WPA", ignoreCase = true) ||
            capabilities.contains("PSK", ignoreCase = true) -> WifiSecurity.WPA2
        capabilities.contains("WEP", ignoreCase = true) -> WifiSecurity.WEP
        else -> WifiSecurity.OPEN
    }

    private fun calculateBars(rssi: Int): Int {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            wifiManager.calculateSignalLevel(rssi).coerceIn(0, 4)
        } else {
            @Suppress("DEPRECATION")
            WifiManager.calculateSignalLevel(rssi, 5).coerceIn(0, 4)
        }
    }

    private fun rssiToPercent(rssi: Int): Int {
        return (((rssi + 95f) / 60f) * 100f).toInt().coerceIn(0, 100)
    }

    private fun rssiToQuality(rssi: Int): SignalQuality = when {
        rssi >= -55 -> SignalQuality.EXCELLENT
        rssi >= -67 -> SignalQuality.GOOD
        rssi >= -78 -> SignalQuality.FAIR
        else -> SignalQuality.WEAK
    }
}
