package com.airlink.wifi

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.lifecycle.viewmodel.compose.viewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                colorScheme = lightColorScheme(
                    primary = Color(0xFF2563EB),
                    background = Color(0xFFF8FAFC),
                    surface = Color.White
                )
            ) {
                AirLinkWifiScreen()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AirLinkWifiScreen(viewModel: WifiViewModel = viewModel()) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()

    val requiredPermissions = remember {
        buildList {
            add(Manifest.permission.ACCESS_FINE_LOCATION)
            add(Manifest.permission.ACCESS_COARSE_LOCATION)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                add(Manifest.permission.NEARBY_WIFI_DEVICES)
            }
        }.toTypedArray()
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { results ->
        val allGranted = results.values.all { it }
        viewModel.onPermissionsResult(allGranted)
    }

    LaunchedEffect(Unit) {
        val granted = requiredPermissions.all { perm ->
            ContextCompat.checkSelfPermission(context, perm) == PackageManager.PERMISSION_GRANTED
        }
        if (granted) {
            viewModel.onPermissionsResult(true)
        } else {
            permissionLauncher.launch(requiredPermissions)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("AirLink Wi-Fi", fontWeight = FontWeight.Bold)
                        Text(
                            text = "${uiState.networks.size} Wi-Fi signals found",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF64748B)
                        )
                    }
                },
                actions = {
                    Button(
                        onClick = { viewModel.scanWifiNetworks() },
                        enabled = !uiState.isScanning,
                        modifier = Modifier.padding(end = 12.dp)
                    ) {
                        if (uiState.isScanning) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(16.dp),
                                strokeWidth = 2.dp,
                                color = Color.White
                            )
                            Spacer(Modifier.width(8.dp))
                            Text("Scanning")
                        } else {
                            Icon(Icons.Default.Refresh, contentDescription = null)
                            Spacer(Modifier.width(6.dp))
                            Text("Scan")
                        }
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp)
        ) {
            if (!uiState.hasPermissions) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Column(Modifier.padding(16.dp)) {
                        Text(
                            "Wi-Fi & Location Permission Required",
                            fontWeight = FontWeight.SemiBold
                        )
                        Spacer(Modifier.height(6.dp))
                        Text(
                            "Android requires Location / Nearby Wi-Fi Devices permission to scan SSIDs and measure live RSSI signal strength.",
                            style = MaterialTheme.typography.bodySmall
                        )
                        Spacer(Modifier.height(12.dp))
                        Button(onClick = { permissionLauncher.launch(requiredPermissions) }) {
                            Text("Grant Permission")
                        }
                    }
                }
            }

            // Connected Wi-Fi Live Signal Card
            uiState.connectedInfo?.let { connected ->
                ConnectedSignalCard(
                    info = connected,
                    onDisconnect = { viewModel.disconnectCurrentNetwork() }
                )
                Spacer(Modifier.height(12.dp))
            }

            uiState.statusMessage?.let { msg ->
                Text(
                    text = msg,
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFF475569),
                    modifier = Modifier.padding(vertical = 6.dp)
                )
            }

            Text(
                text = "Available Networks (${uiState.networks.size})",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(vertical = 8.dp)
            )

            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(bottom = 24.dp)
            ) {
                items(uiState.networks, key = { "${it.ssid}_${it.bssid}" }) { network ->
                    val isCurrent = uiState.connectedInfo?.ssid == network.ssid
                    WifiNetworkRow(
                        network = network,
                        isConnected = isCurrent,
                        onClick = { viewModel.selectNetworkForConnect(network) }
                    )
                }
            }
        }
    }

    uiState.selectedNetworkForAuth?.let { target ->
        WifiPasswordDialog(
            network = target,
            isConnecting = uiState.isConnecting,
            error = uiState.connectionError,
            onDismiss = { viewModel.dismissPasswordDialog() },
            onConnect = { pass -> viewModel.connectWithPassword(target, pass) }
        )
    }
}

@Composable
private fun ConnectedSignalCard(
    info: ConnectedWifiInfo,
    onDisconnect: () -> Unit
) {
    val qualityColor = when (info.quality) {
        SignalQuality.EXCELLENT -> Color(0xFF16A34A)
        SignalQuality.GOOD -> Color(0xFF2563EB)
        SignalQuality.FAIR -> Color(0xFFD97706)
        SignalQuality.WEAK -> Color(0xFFDC2626)
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(Modifier.weight(1f)) {
                    Text(
                        text = "Connected · ${info.quality.label}",
                        style = MaterialTheme.typography.labelMedium,
                        color = qualityColor,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = info.ssid,
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                }
                OutlinedButton(onClick = onDisconnect) {
                    Text("Disconnect")
                }
            }

            Spacer(Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Signal: ${info.signalPercent}% (${info.rssiDbm} dBm)",
                    fontWeight = FontWeight.Medium
                )
                Text(
                    text = "${info.linkSpeedMbps} Mbps · ${info.frequencyMhz} MHz",
                    color = Color(0xFF64748B),
                    style = MaterialTheme.typography.bodySmall
                )
            }

            Spacer(Modifier.height(8.dp))

            LinearProgressIndicator(
                progress = { info.signalPercent / 100f },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp),
                color = qualityColor,
                trackColor = Color(0xFFE2E8F0)
            )

            Spacer(Modifier.height(8.dp))
            Text(
                text = "IP: ${info.ipAddress} · BSSID: ${info.bssid}",
                style = MaterialTheme.typography.bodySmall,
                color = Color(0xFF64748B)
            )
        }
    }
}

@Composable
private fun WifiNetworkRow(
    network: WifiAccessPoint,
    isConnected: Boolean,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isConnected) Color(0xFFEFF6FF) else Color.White
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = if (network.security == WifiSecurity.OPEN) {
                    Icons.Default.Wifi
                } else {
                    Icons.Default.WifiLock
                },
                contentDescription = null,
                tint = if (isConnected) Color(0xFF2563EB) else Color(0xFF334155)
            )
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(
                    text = network.ssid,
                    fontWeight = FontWeight.SemiBold,
                    style = MaterialTheme.typography.bodyLarge
                )
                Text(
                    text = "${network.security.name} · ${network.bandLabel} · Ch ${network.channelNumber}",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFF64748B)
                )
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "${network.signalPercent}%",
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF0F172A)
                )
                Text(
                    text = "${network.rssiDbm} dBm",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFF64748B)
                )
            }
        }
    }
}

@Composable
private fun WifiPasswordDialog(
    network: WifiAccessPoint,
    isConnecting: Boolean,
    error: String?,
    onDismiss: () -> Unit,
    onConnect: (String) -> Unit
) {
    var password by remember { mutableStateOf("") }
    var showPassword by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = { if (!isConnecting) onDismiss() },
        title = { Text("Connect to ${network.ssid}") },
        text = {
            Column {
                Text(
                    text = "${network.security.name} · ${network.bandLabel} · ${network.rssiDbm} dBm",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFF64748B)
                )
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Wi-Fi Password") },
                    singleLine = true,
                    enabled = !isConnecting,
                    visualTransformation = if (showPassword) {
                        VisualTransformation.None
                    } else {
                        PasswordVisualTransformation()
                    },
                    trailingIcon = {
                        IconButton(onClick = { showPassword = !showPassword }) {
                            Icon(
                                imageVector = if (showPassword) {
                                    Icons.Default.VisibilityOff
                                } else {
                                    Icons.Default.Visibility
                                },
                                contentDescription = "Toggle password visibility"
                            )
                        }
                    },
                    modifier = Modifier.fillMaxWidth()
                )
                if (error != null) {
                    Spacer(Modifier.height(8.dp))
                    Text(
                        text = error,
                        color = Color(0xFFDC2626),
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { onConnect(password) },
                enabled = !isConnecting && password.isNotEmpty()
            ) {
                Text(if (isConnecting) "Connecting..." else "Connect")
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                enabled = !isConnecting
            ) {
                Text("Cancel")
            }
        }
    )
}
