export type WiFiBand = '2.4 GHz' | '5 GHz' | '6 GHz';

export type SecurityType = 'WPA3-SAE' | 'WPA2/WPA3' | 'WPA2-PSK' | 'Open';

export type SignalQuality = 'excellent' | 'good' | 'fair' | 'weak';

export type Language = 'en' | 'bn';

export type ActiveTab = 'networks' | 'monitor' | 'saved' | 'about';

export interface WiFiNetwork {
  id: string;
  ssid: string;
  bssid: string;
  band: WiFiBand;
  channel: number;
  frequencyMhz: number;
  channelWidthMhz: number;
  baseRssiDbm: number;
  rssiDbm: number;
  security: SecurityType;
  maxSpeedMbps: number;
  vendor: string;
  demoPasskey?: string;
  isHidden?: boolean;
}

export interface SavedNetwork {
  ssid: string;
  security: SecurityType;
  password: string;
  lastConnectedAt: string;
  autoJoin: boolean;
}

export interface SignalSample {
  timestamp: number;
  rssiDbm: number;
  percentage: number;
  linkMbps: number;
}

export interface BrowserConnectionInfo {
  online: boolean;
  effectiveType?: string;
  downlinkMbps?: number;
  rttMs?: number;
  type?: string;
  supported: boolean;
}
