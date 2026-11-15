import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, KeyRound, Lock, ShieldCheck, X } from 'lucide-react';
import { Language, SecurityType, WiFiNetwork } from '../types/wifi';
import { TRANSLATIONS } from '../i18n/translations';
import { rssiToBars, rssiToPercentage } from '../data/mockNetworks';
import { WifiBarsIcon } from './SignalIcons';

interface ConnectModalProps {
  network: WiFiNetwork | null;
  language: Language;
  isConnecting: boolean;
  authPhase: 'idle' | 'authenticating' | 'dhcp';
  error: string | null;
  savedPassword?: string;
  onClose: () => void;
  onSubmit: (password: string, remember: boolean) => void;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({
  network,
  language,
  isConnecting,
  authPhase,
  error,
  savedPassword,
  onClose,
  onSubmit,
}) => {
  const t = TRANSLATIONS[language];
  const [password, setPassword] = useState(savedPassword ?? '');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    setPassword(savedPassword ?? '');
    setShowPassword(false);
  }, [network?.id, savedPassword]);

  if (!network) return null;

  const pct = rssiToPercentage(network.rssiDbm);
  const bars = rssiToBars(network.rssiDbm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password, remember);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="connect-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
              <WifiBarsIcon bars={bars} locked={network.security !== 'Open'} active />
            </div>
            <div className="min-w-0">
              <h2 id="connect-modal-title" className="truncate text-base font-semibold text-slate-900">
                {t.connectModalTitle(network.ssid)}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 font-mono tabular-nums">
                {network.security} · {network.band} · {pct}% ({network.rssiDbm} dBm)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isConnecting}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label={t.cancel}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {network.security !== 'Open' ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="wifi-password-input" className="text-sm font-medium text-slate-700">
                  {t.passwordLabel}
                </label>
                {network.demoPasskey && (
                  <button
                    type="button"
                    onClick={() => setPassword(network.demoPasskey ?? '')}
                    disabled={isConnecting}
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    {t.fillDemoKey}
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  id="wifi-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  disabled={isConnecting}
                  autoFocus
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-3.5 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 disabled:bg-slate-50 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {network.demoPasskey && (
                <p className="mt-1.5 text-xs text-slate-500 font-mono">
                  {t.demoKeyHint(network.demoPasskey)}
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs text-amber-900">
              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0" />
                <span>{t.openNetwork}</span>
              </div>
            </div>
          )}

          {network.security !== 'Open' && (
            <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={isConnecting}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
              />
              <span>{t.rememberNetwork}</span>
            </label>
          )}

          {isConnecting && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-3 text-xs font-medium text-blue-800 flex items-center gap-2.5">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0" />
              <span>
                {authPhase === 'dhcp' ? t.authStepDhcp : t.authStepAuthenticating}
              </span>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isConnecting}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isConnecting || (network.security !== 'Open' && password.length === 0)}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isConnecting ? t.connectingAction : t.connectAction}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface HiddenNetworkModalProps {
  open: boolean;
  language: Language;
  onClose: () => void;
  onJoin: (ssid: string, security: SecurityType, password: string) => void;
}

export const HiddenNetworkModal: React.FC<HiddenNetworkModalProps> = ({
  open,
  language,
  onClose,
  onJoin,
}) => {
  const t = TRANSLATIONS[language];
  const [ssid, setSsid] = useState('');
  const [security, setSecurity] = useState<SecurityType>('WPA3-SAE');
  const [password, setPassword] = useState('');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssid.trim()) return;
    onJoin(ssid.trim(), security, password);
    setSsid('');
    setPassword('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">{t.hiddenModalTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label={t.cancel}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label htmlFor="hidden-ssid" className="block text-sm font-medium text-slate-700 mb-1.5">
              {t.ssidLabel}
            </label>
            <input
              id="hidden-ssid"
              type="text"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              placeholder={t.ssidPlaceholder}
              required
              autoFocus
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
            />
          </div>

          <div>
            <label htmlFor="hidden-security" className="block text-sm font-medium text-slate-700 mb-1.5">
              {t.securityLabel}
            </label>
            <select
              id="hidden-security"
              value={security}
              onChange={(e) => setSecurity(e.target.value as SecurityType)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
            >
              <option value="WPA3-SAE">WPA3-SAE</option>
              <option value="WPA2/WPA3">WPA2/WPA3</option>
              <option value="WPA2-PSK">WPA2-PSK</option>
              <option value="Open">Open</option>
            </select>
          </div>

          {security !== 'Open' && (
            <div>
              <label htmlFor="hidden-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                {t.passwordLabel}
              </label>
              <input
                id="hidden-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                minLength={8}
                required
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer"
            >
              {t.connectAction}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
