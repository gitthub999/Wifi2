import React from 'react';
import { WifiOff, Trash2, Radio } from 'lucide-react';
import {
  BrowserConnectionInfo,
  Language,
  SavedNetwork,
  SignalSample,
  WiFiNetwork,
} from '../types/wifi';
import { TRANSLATIONS } from '../i18n/translations';
import { rssiToBars, rssiToPercentage, rssiToQuality } from '../data/mockNetworks';
import { SignalSparkline, WifiBarsIcon } from './SignalIcons';

interface SignalMonitorPanelProps {
  language: Language;
  connectedNetwork: WiFiNetwork | null;
  liveRssiDbm: number;
  liveLinkMbps: number;
  distanceMeters: number;
  onDistanceChange: (meters: number) => void;
  signalHistory: SignalSample[];
  onDisconnect: () => void;
  onForget: (ssid: string) => void;
  savedNetworks: SavedNetwork[];
  browserLink: BrowserConnectionInfo;
}

export const SignalMonitorPanel: React.FC<SignalMonitorPanelProps> = ({
  language,
  connectedNetwork,
  liveRssiDbm,
  liveLinkMbps,
  distanceMeters,
  onDistanceChange,
  signalHistory,
  onDisconnect,
  onForget,
  savedNetworks,
  browserLink,
}) => {
  const t = TRANSLATIONS[language];

  const pct = connectedNetwork ? rssiToPercentage(liveRssiDbm) : 0;
  const bars = connectedNetwork ? rssiToBars(liveRssiDbm) : 1;
  const quality = connectedNetwork ? rssiToQuality(liveRssiDbm) : 'weak';

  const qualityStyle =
    quality === 'excellent'
      ? { text: 'text-emerald-700', bar: 'bg-emerald-600' }
      : quality === 'good'
      ? { text: 'text-blue-700', bar: 'bg-blue-600' }
      : quality === 'fair'
      ? { text: 'text-amber-700', bar: 'bg-amber-500' }
      : { text: 'text-red-700', bar: 'bg-red-600' };

  const isSaved = connectedNetwork
    ? savedNetworks.some((s) => s.ssid === connectedNetwork.ssid)
    : false;

  return (
    <div className="space-y-6">
      {/* Main Connected Signal Strength Card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">{t.signalMonitorTitle}</h2>
          {connectedNetwork && (
            <span className={`text-xs font-semibold ${qualityStyle.text}`}>
              {t.qualityLabels[quality]}
            </span>
          )}
        </div>

        {!connectedNetwork ? (
          <div className="py-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <WifiOff className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">{t.noActiveConnectionTitle}</h3>
            <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-slate-500">
              {t.noActiveConnectionBody}
            </p>
          </div>
        ) : (
          <div className="pt-5 space-y-5">
            {/* Connected Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  <WifiBarsIcon bars={bars} active size={26} />
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-bold text-slate-900 truncate">
                    {connectedNetwork.ssid}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    {connectedNetwork.security} · {connectedNetwork.band} · Ch {connectedNetwork.channel}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isSaved && (
                  <button
                    type="button"
                    onClick={() => onForget(connectedNetwork.ssid)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-red-600 cursor-pointer whitespace-nowrap"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t.forgetNetwork}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onDisconnect}
                  className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50 cursor-pointer whitespace-nowrap"
                >
                  {t.disconnect}
                </button>
              </div>
            </div>

            {/* Signal Percentage + dBm Bar */}
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">{t.signalStrengthLabel}</span>
                <div className="font-mono tabular-nums text-sm">
                  <span className="text-xl font-bold text-slate-900">{pct}%</span>
                  <span className="ml-2 text-xs text-slate-500">{liveRssiDbm} dBm</span>
                </div>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${qualityStyle.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Distance Simulation Slider */}
            <div className="pt-1">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label htmlFor="distance-slider" className="font-medium text-slate-600">
                  {t.distanceSimulatorLabel}
                </label>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {t.distanceUnit(distanceMeters)}
                </span>
              </div>
              <input
                id="distance-slider"
                type="range"
                min={1}
                max={30}
                value={distanceMeters}
                onChange={(e) => onDistanceChange(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Live RSSI History Chart */}
            <div className="pt-1">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">{t.signalHistoryTitle}</span>
                <span className="text-xs font-mono tabular-nums text-slate-500">
                  {liveLinkMbps} Mbps
                </span>
              </div>
              <SignalSparkline samples={signalHistory} quality={quality} />
            </div>

            {/* Connection Details Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-slate-100 pt-4 text-xs">
              <div>
                <div className="text-slate-500">{t.linkSpeedLabel}</div>
                <div className="mt-0.5 font-mono tabular-nums font-medium text-slate-900">
                  {liveLinkMbps} Mbps ({connectedNetwork.channelWidthMhz} MHz)
                </div>
              </div>
              <div>
                <div className="text-slate-500">{t.frequencyLabel}</div>
                <div className="mt-0.5 font-mono tabular-nums font-medium text-slate-900">
                  {connectedNetwork.frequencyMhz} MHz · Ch {connectedNetwork.channel}
                </div>
              </div>
              <div>
                <div className="text-slate-500">{t.ipAddressLabel}</div>
                <div className="mt-0.5 font-mono tabular-nums font-medium text-slate-900">
                  192.168.1.142
                </div>
              </div>
              <div>
                <div className="text-slate-500">{t.bssidLabel}</div>
                <div className="mt-0.5 font-mono tabular-nums font-medium text-slate-900">
                  {connectedNetwork.bssid}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Saved Profiles + Host Browser Real Link */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">{t.savedNetworksTitle}</h3>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {t.savedCountLabel(savedNetworks.length)}
            </span>
          </div>

          {savedNetworks.length === 0 ? (
            <p className="text-xs text-slate-500">{t.noSavedNetworks}</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {savedNetworks.map((saved) => (
                <li key={saved.ssid} className="flex items-center justify-between py-2.5 text-xs">
                  <div>
                    <div className="font-medium text-slate-900">{saved.ssid}</div>
                    <div className="text-slate-500 font-mono">{saved.security}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onForget(saved.ssid)}
                    className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                    aria-label={`${t.forgetNetwork} ${saved.ssid}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <Radio className="h-3.5 w-3.5 text-slate-500" />
              <span>{t.browserLinkTitle}</span>
            </div>
            <span className="text-xs font-medium text-slate-600">
              {browserLink.online ? t.onlineLabel : t.offlineLabel}
            </span>
          </div>
          {browserLink.supported ? (
            <div className="grid grid-cols-3 gap-3 text-xs font-mono tabular-nums">
              <div>
                <div className="text-slate-400 font-sans">Type</div>
                <div className="text-slate-800">{browserLink.effectiveType ?? '—'}</div>
              </div>
              <div>
                <div className="text-slate-400 font-sans">Downlink</div>
                <div className="text-slate-800">
                  {browserLink.downlinkMbps !== undefined ? `${browserLink.downlinkMbps} Mbps` : '—'}
                </div>
              </div>
              <div>
                <div className="text-slate-400 font-sans">RTT</div>
                <div className="text-slate-800">
                  {browserLink.rttMs !== undefined ? `${browserLink.rttMs} ms` : '—'}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">{t.notSupportedLabel}</p>
          )}
        </div>
      </section>
    </div>
  );
};
