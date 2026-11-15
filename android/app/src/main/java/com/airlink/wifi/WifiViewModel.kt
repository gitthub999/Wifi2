package com.airlink.wifi

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

class WifiViewModel(application: Application) : AndroidViewModel(application) {

    private val controller = WifiController(application.applicationContext)

    private val _uiState = MutableStateFlow(
        WifiUiState(isWifiEnabled = controller.isWifiEnabled())
    )
    val uiState: StateFlow<WifiUiState> = _uiState.asStateFlow()

    init {
        startSignalPolling()
    }

    fun onPermissionsResult(granted: Boolean) {
        _uiState.update { it.copy(hasPermissions = granted) }
        if (granted) {
            scanWifiNetworks()
        }
    }

    fun scanWifiNetworks() {
        if (!_uiState.value.hasPermissions) {
            _uiState.update {
                it.copy(statusMessage = "Location / Nearby Wi-Fi permission is required to scan.")
            }
            return
        }

        _uiState.update {
            it.copy(
                isScanning = true,
                isWifiEnabled = controller.isWifiEnabled(),
                statusMessage = null
            )
        }

        controller.startScan { results, fresh ->
            _uiState.update { state ->
                state.copy(
                    isScanning = false,
                    networks = results,
                    statusMessage = if (fresh) {
                        "${results.size} Wi-Fi signals found"
                    } else {
                        "${results.size} cached Wi-Fi signals loaded (Android scan throttle active)"
                    }
                )
            }
        }
    }

    fun selectNetworkForConnect(network: WifiAccessPoint) {
        if (network.security == WifiSecurity.OPEN) {
            connectWithPassword(network, "")
        } else {
            _uiState.update {
                it.copy(
                    selectedNetworkForAuth = network,
                    connectionError = null
                )
            }
        }
    }

    fun dismissPasswordDialog() {
        _uiState.update {
            it.copy(
                selectedNetworkForAuth = null,
                connectionError = null,
                isConnecting = false
            )
        }
    }

    fun connectWithPassword(network: WifiAccessPoint, password: String) {
        if (network.security != WifiSecurity.OPEN && password.length < 8) {
            _uiState.update {
                it.copy(connectionError = "WPA2/WPA3 password must be at least 8 characters.")
            }
            return
        }

        _uiState.update {
            it.copy(
                isConnecting = true,
                connectionError = null
            )
        }

        controller.connectToNetwork(
            network = network,
            password = password,
            onConnected = { connected ->
                _uiState.update { state ->
                    val updatedHistory = (state.rssiHistory + connected.rssiDbm).takeLast(30)
                    state.copy(
                        isConnecting = false,
                        selectedNetworkForAuth = null,
                        connectedInfo = connected,
                        rssiHistory = updatedHistory,
                        connectionError = null,
                        statusMessage = "Connected to ${connected.ssid}"
                    )
                }
            },
            onFailure = { errorMsg ->
                _uiState.update {
                    it.copy(
                        isConnecting = false,
                        connectionError = errorMsg
                    )
                }
            }
        )
    }

    fun disconnectCurrentNetwork() {
        controller.disconnect()
        _uiState.update {
            it.copy(
                connectedInfo = null,
                rssiHistory = emptyList(),
                statusMessage = "Disconnected from Wi-Fi"
            )
        }
    }

    private fun startSignalPolling() {
        viewModelScope.launch {
            while (isActive) {
                if (_uiState.value.hasPermissions) {
                    val liveSignal = controller.readLiveConnectedSignal()
                    if (liveSignal != null) {
                        _uiState.update { state ->
                            val history = (state.rssiHistory + liveSignal.rssiDbm).takeLast(30)
                            state.copy(
                                connectedInfo = liveSignal,
                                rssiHistory = history
                            )
                        }
                    }
                }
                delay(1500L)
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        controller.cleanup()
    }
}
