import { SignalQuality, WiFiNetwork } from '../types/wifi';

export function rssiToPercentage(rssiDbm: number): number {
  const clamped = Math.max(-95, Math.min(-35, rssiDbm));
  return Math.round(((clamped + 95) / 60) * 100);
}

export function rssiToBars(rssiDbm: number): 1 | 2 | 3 | 4 {
  if (rssiDbm >= -55) return 4;
  if (rssiDbm >= -67) return 3;
  if (rssiDbm >= -78) return 2;
  return 1;
}

export function rssiToQuality(rssiDbm: number): SignalQuality {
  if (rssiDbm >= -55) return 'excellent';
  if (rssiDbm >= -67) return 'good';
  if (rssiDbm >= -78) return 'fair';
  return 'weak';
}

export const INITIAL_WIFI_NETWORKS: WiFiNetwork[] = [
  {
    id: 'ap-home-fiber-5g',
    ssid: 'HomeFiber_5G',
    bssid: 'A4:2B:B0:91:4E:12',
    band: '5 GHz',
    channel: 36,
    frequencyMhz: 5180,
    channelWidthMhz: 80,
    baseRssiDbm: -42,
    rssiDbm: -42,
    security: 'WPA3-SAE',
    maxSpeedMbps: 1200,
    vendor: 'ASUS RT-AX58U',
    demoPasskey: 'fiber2026',
  },
  {
    id: 'ap-studio-6e',
    ssid: 'Studio_Mesh_6E',
    bssid: '7C:10:C9:3A:88:04',
    band: '6 GHz',
    channel: 5,
    frequencyMhz: 5975,
    channelWidthMhz: 160,
    baseRssiDbm: -49,
    rssiDbm: -49,
    security: 'WPA3-SAE',
    maxSpeedMbps: 2400,
    vendor: 'Ubiquiti U6-Enterprise',
    demoPasskey: 'studio9988',
  },
  {
    id: 'ap-home-fiber-24g',
    ssid: 'HomeFiber_2.4G',
    bssid: 'A4:2B:B0:91:4E:10',
    band: '2.4 GHz',
    channel: 6,
    frequencyMhz: 2437,
    channelWidthMhz: 20,
    baseRssiDbm: -53,
    rssiDbm: -53,
    security: 'WPA2/WPA3',
    maxSpeedMbps: 300,
    vendor: 'ASUS RT-AX58U',
    demoPasskey: 'fiber2026',
  },
  {
    id: 'ap-cafe-free',
    ssid: 'Roastery_Guest_Free',
    bssid: 'D8:47:32:1B:6F:A0',
    band: '2.4 GHz',
    channel: 1,
    frequencyMhz: 2412,
    channelWidthMhz: 20,
    baseRssiDbm: -61,
    rssiDbm: -61,
    security: 'Open',
    maxSpeedMbps: 144,
    vendor: 'TP-Link Omada',
  },
  {
    id: 'ap-office-lan',
    ssid: 'DevLab_5GHz',
    bssid: 'E0:D5:5E:44:21:9C',
    band: '5 GHz',
    channel: 149,
    frequencyMhz: 5745,
    channelWidthMhz: 80,
    baseRssiDbm: -66,
    rssiDbm: -66,
    security: 'WPA2-PSK',
    maxSpeedMbps: 866,
    vendor: 'MikroTik hAP ax3',
    demoPasskey: 'devlab2026',
  },
  {
    id: 'ap-neighbor-1',
    ssid: 'Airtel_Xstream_404',
    bssid: '54:AF:97:08:CC:31',
    band: '5 GHz',
    channel: 44,
    frequencyMhz: 5220,
    channelWidthMhz: 40,
    baseRssiDbm: -74,
    rssiDbm: -74,
    security: 'WPA2-PSK',
    maxSpeedMbps: 433,
    vendor: 'Nokia Beacon',
    demoPasskey: 'airtel5500',
  },
  {
    id: 'ap-neighbor-2',
    ssid: 'Tenda_AC1200_3F',
    bssid: 'C8:3A:35:62:19:E8',
    band: '2.4 GHz',
    channel: 11,
    frequencyMhz: 2462,
    channelWidthMhz: 20,
    baseRssiDbm: -81,
    rssiDbm: -81,
    security: 'WPA2-PSK',
    maxSpeedMbps: 150,
    vendor: 'Tenda',
    demoPasskey: 'tenda1234',
  },
  {
    id: 'ap-garage-iot',
    ssid: 'SmartHome_IoT',
    bssid: '30:B5:C2:7E:50:11',
    band: '2.4 GHz',
    channel: 3,
    frequencyMhz: 2422,
    channelWidthMhz: 20,
    baseRssiDbm: -86,
    rssiDbm: -86,
    security: 'WPA2-PSK',
    maxSpeedMbps: 72,
    vendor: 'ESP32 Mesh Gateway',
    demoPasskey: 'iotmesh24',
  },
];
