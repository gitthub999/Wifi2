import React, { useEffect, useMemo, useState } from 'react';
import { Lock, Plus, RefreshCw, Search, Wifi } from 'lucide-react';
import {
  INITIAL_WIFI_NETWORKS,
  rssiToBars,
  rssiToPercentage,
} from './data/mockNetworks';
import { TRANSLATIONS } from './i18n/translations';
import {
  BrowserConnectionInfo,
  Language,
  SavedNetwork,
  SecurityType,
  SignalSample,
  WiFiBand,
  WiFiNetwork,
} from './types/wifi';
import { WifiBarsIcon } from './components/SignalIcons';
import { ConnectModal, HiddenNetworkModal } from './components/ConnectModal';
import { SignalMonitorPanel } from './components/SignalMonitorPanel';
import { KotlinSourceView } from './components/KotlinSourceView';
import { AndroidSetupView } from './components/AndroidSetupView';

type MainSection = 'preview' | 'kotlin' | 'setup';
type BandFilter = 'all' | WiFiBand;

const SAVED_STORAGE_KEY = 'airlink_saved_wifi_v1';

interface NavigatorNetworkInformation extends EventTarget {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  type?: string;
}

function readBrowserConnection(): BrowserConnectionInfo {
  const nav = navigator as Navigator & { connection?: NavigatorNetworkInformation };
  const conn = nav.connection;
  return {
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    supported: Boolean(conn),
    effectiveType: conn?.effectiveType,
    downlinkMbps: conn?.downlink,
    rttMs: conn?.rtt,
    type: conn?.type,
  };
}

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [section, setSection] = useState<MainSection>('preview');

  const [networks, setNetworks] = useState<WiFiNetwork[]>(INITIAL_WIFI_NETWORKS);
  const [isScanning, setIsScanning] = useState(false);
  const [bandFilter, setBandFilter] = useState<BandFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [connectedId, setConnectedId] = useState<string | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number>(3);
  const [liveRssiDbm, setLiveRssiDbm] = useState<number>(-42);
  const [liveLinkMbps, setLiveLinkMbps] = useState<number>(1200);
  const [signalHistory, setSignalHistory] = useState<SignalSample[]>([]);

  const [authTarget, setAuthTarget] = useState<WiFiNetwork | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [authPhase, setAuthPhase] = useState<'idle' | 'authenticating' | 'dhcp'>('idle');
  const [authError, setAuthError] = useState<string | null>(null);
  const [hiddenModalOpen, setHiddenModalOpen] = useState(false);

  const [savedNetworks, setSavedNetworks] = useState<SavedNetwork[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SavedNetwork[]) : [];
    } catch {
      return [];
    }
  });

  const [browserLink, setBrowserLink] = useState<BrowserConnectionInfo>(() =>
    readBrowserConnection()
  );

  const t = TRANSLATIONS[language];

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedNetworks));
    } catch {
      // Ignore storage quota errors
    }
  }, [savedNetworks]);

  useEffect(() => {
    const updateBrowserLink = () => setBrowserLink(readBrowserConnection());
    window.addEventListener('online', updateBrowserLink);
    window.addEventListener('offline', updateBrowserLink);
    const nav = navigator as Navigator & { connection?: NavigatorNetworkInformation };
    nav.connection?.addEventListener('change', updateBrowserLink);

    return () => {
      window.removeEventListener('online', updateBrowserLink);
      window.removeEventListener('offline', updateBrowserLink);
      nav.connection?.removeEventListener('change', updateBrowserLink);
    };
  }, []);

  const connectedNetwork = useMemo(
    () => networks.find((n) => n.id === connectedId) ?? null,
    [networks, connectedId]
  );

  // Live signal strength fluctuation & distance attenuation loop when connected
  useEffect(() => {
    if (!connectedNetwork) {
      setSignalHistory([]);
      return;
    }

    const computeSample = () => {
      const distanceDrop = Math.round((distanceMeters - 3) * 1.45);
      const jitter = Math.round((Math.random() - 0.5) * 4);
      const nextRssi = Math.max(
        -94,
        Math.min(-35, connectedNetwork.baseRssiDbm - distanceDrop + jitter)
      );
      const pct = rssiToPercentage(nextRssi);
      const scaledSpeed = Math.max(
        18,
        Math.round(connectedNetwork.maxSpeedMbps * (0.25 + 0.75 * (pct / 100)))
      );

      setLiveRssiDbm(nextRssi);
      setLiveLinkMbps(scaledSpeed);
      setSignalHistory((prev) =>
        [
          ...prev,
          {
            timestamp: Date.now(),
            rssiDbm: nextRssi,
            percentage: pct,
            linkMbps: scaledSpeed,
          },
        ].slice(-26)
      );
    };

    computeSample();
    const interval = window.setInterval(computeSample, 1200);
    return () => window.clearInterval(interval);
  }, [connectedNetwork, distanceMeters]);

  const handleScan = () => {
    if (isScanning) return;
    setSection('preview');
    setIsScanning(true);

    window.setTimeout(() => {
      setNetworks((prev) =>
        prev
          .map((net) => {
            const drift = Math.round((Math.random() - 0.5) * 6);
            const nextRssi = Math.max(-92, Math.min(-36, net.baseRssiDbm + drift));
            return { ...net, rssiDbm: nextRssi };
          })
          .sort((a, b) => b.rssiDbm - a.rssiDbm)
      );
      setIsScanning(false);
    }, 900);
  };

  const initiateConnection = (
    target: WiFiNetwork,
    password: string,
    remember: boolean,
    skipModalDelay = false
  ) => {
    if (target.security !== 'Open' && password.length < 8) {
      setAuthError(t.shortPasswordError);
      return;
    }

    setIsConnecting(true);
    setAuthPhase('authenticating');
    setAuthError(null);

    const authDelay = skipModalDelay ? 350 : 650;
    window.setTimeout(() => {
      // Check against demoPasskey if network has one and isn't a custom hidden network
      if (
        target.security !== 'Open' &&
        target.demoPasskey &&
        password !== target.demoPasskey
      ) {
        setIsConnecting(false);
        setAuthPhase('idle');
        setAuthError(t.wrongPasswordError);
        return;
      }

      setAuthPhase('dhcp');
      window.setTimeout(() => {
        setConnectedId(target.id);
        setDistanceMeters(3);
        setIsConnecting(false);
        setAuthPhase('idle');
        setAuthTarget(null);
        setAuthError(null);

        if (remember && target.security !== 'Open') {
          setSavedNetworks((prev) => {
            const filtered = prev.filter((item) => item.ssid !== target.ssid);
            return [
              {
                ssid: target.ssid,
                security: target.security,
                password,
                lastConnectedAt: new Date().toISOString(),
                autoJoin: true,
              },
              ...filtered,
            ];
          });
        }
      }, 450);
    }, authDelay);
  };

  const handleSelectNetwork = (network: WiFiNetwork) => {
    if (network.id === connectedId) return;

    if (network.security === 'Open') {
      setAuthTarget(network);
      initiateConnection(network, '', false, true);
      return;
    }

    const saved = savedNetworks.find((s) => s.ssid === network.ssid);
    if (saved && (!network.demoPasskey || saved.password === network.demoPasskey)) {
      setAuthTarget(network);
      initiateConnection(network, saved.password, true, true);
      return;
    }

    setAuthError(null);
    setAuthTarget(network);
  };

  const handleJoinHidden = (ssid: string, security: SecurityType, password: string) => {
    const newHidden: WiFiNetwork = {
      id: `ap-hidden-${Date.now()}`,
      ssid,
      bssid: '02:88:41:A9:12:F0',
      band: '5 GHz',
      channel: 100,
      frequencyMhz: 5500,
      channelWidthMhz: 80,
      baseRssiDbm: -56,
      rssiDbm: -56,
      security,
      maxSpeedMbps: 866,
      vendor: 'Hidden Access Point',
      isHidden: true,
    };
    setNetworks((prev) => [newHidden, ...prev]);
    setAuthTarget(newHidden);
    initiateConnection(newHidden, password, true, true);
  };

  const handleForgetNetwork = (ssid: string) => {
    setSavedNetworks((prev) => prev.filter((s) => s.ssid !== ssid));
    if (connectedNetwork?.ssid === ssid) {
      setConnectedId(null);
    }
  };

  const filteredNetworks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return networks.filter((net) => {
      const bandMatch = bandFilter === 'all' || net.band === bandFilter;
      const queryMatch =
        q.length === 0 ||
        net.ssid.toLowerCase().includes(q) ||
        net.vendor.toLowerCase().includes(q) ||
        net.security.toLowerCase().includes(q);
      return bandMatch && queryMatch;
    });
  }, [networks, bandFilter, searchQuery]);

  const savedPasswordForTarget = authTarget
    ? savedNetworks.find((s) => s.ssid === authTarget.ssid)?.password
    : undefined;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Bar Contract: Zone 1 (Wordmark) · Zone 2 (Nav Links) · Zone 3 (1 Primary CTA) */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-3.5">
          <button
            type="button"
            onClick={() => setSection('preview')}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t.brand}
          </button>

          <nav className="flex items-center gap-6 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSection('preview')}
              className={`py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                section === 'preview'
                  ? 'border-blue-600 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {t.navPreview}
            </button>
            <button
              type="button"
              onClick={() => setSection('kotlin')}
              className={`py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                section === 'kotlin'
                  ? 'border-blue-600 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {t.navKotlin}
            </button>
            <button
              type="button"
              onClick={() => setSection('setup')}
              className={`py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                section === 'setup'
                  ? 'border-blue-600 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {t.navSetup}
            </button>
          </nav>

          <button
            type="button"
            onClick={handleScan}
            disabled={isScanning}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-70 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? t.scanningButton : t.scanButton}</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        {/* Workspace Toolbar (Mode/Language Switch + Band Filters + Notice) */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span className="font-semibold text-slate-900 font-mono tabular-nums">
              {t.detectedLabel(networks.length)}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <button
              type="button"
              onClick={() => setSection('kotlin')}
              className="text-xs font-medium text-blue-600 hover:underline cursor-pointer whitespace-nowrap"
            >
              {language === 'bn'
                ? 'আসল Android Kotlin কোড দেখুন →'
                : 'View Native Android Kotlin Project →'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Language Switcher */}
            <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  language === 'en'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('bn')}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  language === 'bn'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                বাংলা
              </button>
            </div>
          </div>
        </div>

        {section === 'preview' && (
          <>
            {/* Honest Browser Preview Notice */}
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs leading-relaxed text-slate-600">
                <span className="font-semibold text-slate-900">{t.browserNoteTitle}: </span>
                {t.browserNoteBody}
              </div>
              <button
                type="button"
                onClick={() => setSection('kotlin')}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.navKotlin}
              </button>
            </div>

            {/* 12-Column Split: Scanned Networks List (7 cols) + Live Signal Strength Monitor (5 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Scanned Wi-Fi List */}
              <section className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="border-b border-slate-100 px-6 py-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h1 className="text-base font-semibold text-slate-900">
                        {t.availableNetworksTitle}
                      </h1>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {t.availableNetworksSubtitle}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHiddenModalOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>{t.addHidden}</span>
                    </button>
                  </div>

                  {/* Filter Bar */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                      {(['all', '2.4 GHz', '5 GHz', '6 GHz'] as BandFilter[]).map((band) => (
                        <button
                          key={band}
                          type="button"
                          onClick={() => setBandFilter(band)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            bandFilter === band
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {band === 'all' ? t.allBands : band}
                        </button>
                      ))}
                    </div>

                    <div className="relative flex-1 sm:max-w-xs">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.searchPlaceholder}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Network Rows */}
                {isScanning ? (
                  <div className="divide-y divide-slate-100">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <div key={idx} className="flex items-center justify-between px-6 py-4 animate-pulse">
                        <div className="flex items-center gap-3.5">
                          <div className="h-9 w-9 rounded-xl bg-slate-100" />
                          <div className="space-y-2">
                            <div className="h-3.5 w-36 rounded bg-slate-100" />
                            <div className="h-2.5 w-48 rounded bg-slate-100" />
                          </div>
                        </div>
                        <div className="h-4 w-16 rounded bg-slate-100" />
                      </div>
                    ))}
                  </div>
                ) : filteredNetworks.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <Wifi className="mx-auto h-6 w-6 text-slate-300" />
                    <p className="mt-2 text-sm font-medium text-slate-700">
                      {language === 'bn'
                        ? 'এই ফিল্টারে কোনো Wi-Fi পাওয়া যায়নি'
                        : 'No matching Wi-Fi networks found'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredNetworks.map((net) => {
                      const isConnected = net.id === connectedId;
                      const displayRssi = isConnected ? liveRssiDbm : net.rssiDbm;
                      const pct = rssiToPercentage(displayRssi);
                      const bars = rssiToBars(displayRssi);
                      const isSaved = savedNetworks.some((s) => s.ssid === net.ssid);

                      return (
                        <button
                          key={net.id}
                          type="button"
                          onClick={() => handleSelectNetwork(net)}
                          className={`w-full flex items-center justify-between gap-4 px-6 py-4 text-left transition-colors cursor-pointer ${
                            isConnected
                              ? 'bg-blue-50/60 hover:bg-blue-50'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                isConnected ? 'bg-blue-100/70' : 'bg-slate-100'
                              }`}
                            >
                              <WifiBarsIcon
                                bars={bars}
                                locked={net.security !== 'Open'}
                                active={isConnected}
                                size={22}
                              />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="truncate text-sm font-semibold text-slate-900">
                                  {net.ssid}
                                </span>
                                {isConnected && (
                                  <span className="text-xs font-semibold text-blue-600 shrink-0">
                                    · {t.connectedBadge}
                                  </span>
                                )}
                              </div>

                              <div className="mt-0.5 truncate text-xs text-slate-500 font-mono">
                                {net.security} · {net.band} · Ch {net.channel} · {net.vendor}
                                {isSaved && !isConnected ? ' · Saved' : ''}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right font-mono tabular-nums">
                              <div className="text-sm font-semibold text-slate-900">{pct}%</div>
                              <div className="text-[11px] text-slate-500">{displayRssi} dBm</div>
                            </div>
                            {net.security !== 'Open' && (
                              <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Right Column: Live Signal Strength & Saved Networks */}
              <div className="lg:col-span-5">
                <SignalMonitorPanel
                  language={language}
                  connectedNetwork={connectedNetwork}
                  liveRssiDbm={liveRssiDbm}
                  liveLinkMbps={liveLinkMbps}
                  distanceMeters={distanceMeters}
                  onDistanceChange={setDistanceMeters}
                  signalHistory={signalHistory}
                  onDisconnect={() => setConnectedId(null)}
                  onForget={handleForgetNetwork}
                  savedNetworks={savedNetworks}
                  browserLink={browserLink}
                />
              </div>
            </div>
          </>
        )}

        {section === 'kotlin' && <KotlinSourceView language={language} />}

        {section === 'setup' && (
          <AndroidSetupView
            language={language}
            onOpenKotlinSource={() => setSection('kotlin')}
          />
        )}
      </main>

      <ConnectModal
        network={authTarget}
        language={language}
        isConnecting={isConnecting}
        authPhase={authPhase}
        error={authError}
        savedPassword={savedPasswordForTarget}
        onClose={() => {
          if (!isConnecting) {
            setAuthTarget(null);
            setAuthError(null);
          }
        }}
        onSubmit={(password, remember) => {
          if (authTarget) {
            initiateConnection(authTarget, password, remember);
          }
        }}
      />

      <HiddenNetworkModal
        open={hiddenModalOpen}
        language={language}
        onClose={() => setHiddenModalOpen(false)}
        onJoin={handleJoinHidden}
      />
    </div>
  );
}
