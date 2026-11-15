package com.airlink.wifi

enum class WifiSecurity {
    WPA3,
    WPA2,
    WEP,
    OPEN
}

enum class SignalQuality(val label: String) {
    EXCELLENT("Excellent"),
    GOOD("Good"),
    FAIR("Fair"),
    WEAK("Weak")
}

data class WifiAccessPoint(
    val ssid: String,
    val bssid: String,
    val rssiDbm: Int,
    val frequencyMhz: Int,
    val security: WifiSecurity,
    val signalPercent: Int,
    val signalLevelBars: Int // 0..4
) {
    val bandLabel: String
        get() = when {
            frequencyMhz >= 5925 -> "6 GHz"
            frequencyMhz >= 4900 -> "5 GHz"
            else -> "2.4 GHz"
        }

    val channelNumber: Int
        get() = when {
            frequencyMhz == 2484 -> 14
            frequencyMhz in 2412..2472 -> (frequencyMhz - 2412) / 5 + 1
            frequencyMhz in 5180..5885 -> (frequencyMhz - 5000) / 5
            frequencyMhz in 5955..7115 -> (frequencyMhz - 5950) / 5
            else -> 0
        }
}

data class ConnectedWifiInfo(
    val ssid: String,
    val bssid: String,
    val rssiDbm: Int,
    val signalPercent: Int,
    val signalLevelBars: Int,
    val quality: SignalQuality,
    val linkSpeedMbps: Int,
    val frequencyMhz: Int,
    val ipAddress: String
)

data class WifiUiState(
    val hasPermissions: Boolean = false,
    val isWifiEnabled: Boolean = true,
    val isScanning: Boolean = false,
    val networks: List<WifiAccessPoint> = emptyList(),
    val connectedInfo: ConnectedWifiInfo? = null,
    val rssiHistory: List<Int> = emptyList(),
    val selectedNetworkForAuth: WifiAccessPoint? = null,
    val isConnecting: Boolean = false,
    val connectionError: String? = null,
    val statusMessage: String? = null
)
