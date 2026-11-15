import React, { useState } from 'react';
import { Check, Copy, Download, FileCode2 } from 'lucide-react';
import { Language } from '../types/wifi';
import { TRANSLATIONS } from '../i18n/translations';

import mainActivityRaw from '../../android/app/src/main/java/com/airlink/wifi/MainActivity.kt?raw';
import wifiControllerRaw from '../../android/app/src/main/java/com/airlink/wifi/WifiController.kt?raw';
import wifiViewModelRaw from '../../android/app/src/main/java/com/airlink/wifi/WifiViewModel.kt?raw';
import wifiModelsRaw from '../../android/app/src/main/java/com/airlink/wifi/WifiModels.kt?raw';
import manifestRaw from '../../android/app/src/main/AndroidManifest.xml?raw';
import appGradleRaw from '../../android/app/build.gradle.kts?raw';
import rootGradleRaw from '../../android/build.gradle.kts?raw';
import settingsGradleRaw from '../../android/settings.gradle.kts?raw';
import gradlePropsRaw from '../../android/gradle.properties?raw';
import githubWorkflowRaw from '../../.github/workflows/build-android-apk.yml?raw';

interface SourceFileEntry {
  id: string;
  fileName: string;
  relativePath: string;
  summaryEn: string;
  summaryBn: string;
  content: string;
}

const ANDROID_FILES: SourceFileEntry[] = [
  {
    id: 'github-workflow',
    fileName: 'build-android-apk.yml',
    relativePath: '.github/workflows/build-android-apk.yml',
    summaryEn: 'GitHub Actions CI workflow that compiles the Kotlin app on push and outputs a downloadable Debug APK.',
    summaryBn: 'GitHub Actions ওয়ার্কফ্লো YAML যা GitHub-এ push করলে অটোমেটিক Android APK বিল্ড করে।',
    content: githubWorkflowRaw,
  },
  {
    id: 'main-activity',
    fileName: 'MainActivity.kt',
    relativePath: 'android/app/src/main/java/com/airlink/wifi/MainActivity.kt',
    summaryEn: 'Jetpack Compose Material 3 UI, runtime permission launcher, scanned list, password dialog, and live signal card.',
    summaryBn: 'Jetpack Compose Material 3 UI, পারমিশন রিকোয়েস্ট, Wi-Fi লিস্ট, পাসওয়ার্ড ডায়ালগ এবং লাইভ সিগন্যাল কার্ড।',
    content: mainActivityRaw,
  },
  {
    id: 'wifi-controller',
    fileName: 'WifiController.kt',
    relativePath: 'android/app/src/main/java/com/airlink/wifi/WifiController.kt',
    summaryEn: 'Android WifiManager scanner, WifiNetworkSpecifier WPA2/WPA3 connector, and ConnectivityManager live RSSI reader.',
    summaryBn: 'আসল Android WifiManager স্ক্যানার, WifiNetworkSpecifier দিয়ে পাসওয়ার্ড কানেক্ট এবং লাইভ RSSI সিগন্যাল রিডার।',
    content: wifiControllerRaw,
  },
  {
    id: 'wifi-viewmodel',
    fileName: 'WifiViewModel.kt',
    relativePath: 'android/app/src/main/java/com/airlink/wifi/WifiViewModel.kt',
    summaryEn: 'StateFlow state holder, scan coordination, password validation, and 1.5s live signal polling loop.',
    summaryBn: 'StateFlow স্টেট ম্যানেজমেন্ট, স্ক্যানিং কন্ট্রোল এবং প্রতি ১.৫ সেকেন্ডে লাইভ সিগন্যাল আপডেট লুপ।',
    content: wifiViewModelRaw,
  },
  {
    id: 'wifi-models',
    fileName: 'WifiModels.kt',
    relativePath: 'android/app/src/main/java/com/airlink/wifi/WifiModels.kt',
    summaryEn: 'Kotlin data classes for WifiAccessPoint, ConnectedWifiInfo, SignalQuality, and WifiUiState.',
    summaryBn: 'Wi-Fi নেটওয়ার্ক ও সিগন্যাল কোয়ালিটির Kotlin ডেটা মডেল।',
    content: wifiModelsRaw,
  },
  {
    id: 'manifest',
    fileName: 'AndroidManifest.xml',
    relativePath: 'android/app/src/main/AndroidManifest.xml',
    summaryEn: 'Required Wi-Fi, Fine Location, and Android 13+ NEARBY_WIFI_DEVICES permissions.',
    summaryBn: 'Wi-Fi স্ক্যান ও কানেক্ট করার জন্য প্রয়োজনীয় Android পারমিশনসমূহ।',
    content: manifestRaw,
  },
  {
    id: 'app-gradle',
    fileName: 'app/build.gradle.kts',
    relativePath: 'android/app/build.gradle.kts',
    summaryEn: 'Android Gradle Kotlin DSL with minSdk 29 (Android 10+), Jetpack Compose BOM, and Material 3.',
    summaryBn: 'minSdk 29 (Android 10+) ও Jetpack Compose ডিপেন্ডেন্সি কনফিগারেশন।',
    content: appGradleRaw,
  },
  {
    id: 'gradle-properties',
    fileName: 'gradle.properties',
    relativePath: 'android/gradle.properties',
    summaryEn: 'Enables AndroidX, non-transitive R classes, and UTF-8 JVM heap settings.',
    summaryBn: 'AndroidX ও Jetpack Compose বিল্ডের জন্য gradle.properties সেটিংস।',
    content: gradlePropsRaw,
  },
  {
    id: 'root-gradle',
    fileName: 'build.gradle.kts',
    relativePath: 'android/build.gradle.kts',
    summaryEn: 'Root Gradle plugin declarations for Android & Kotlin Compose compiler.',
    summaryBn: 'রুট প্রজেক্ট Gradle প্লাগইন কনফিগারেশন।',
    content: rootGradleRaw,
  },
  {
    id: 'settings-gradle',
    fileName: 'settings.gradle.kts',
    relativePath: 'android/settings.gradle.kts',
    summaryEn: 'Project settings and module registration.',
    summaryBn: 'প্রজেক্ট সেটিংস ও অ্যাপ মডিউল রেজিস্ট্রেশন।',
    content: settingsGradleRaw,
  },
];

interface KotlinSourceViewProps {
  language: Language;
}

export const KotlinSourceView: React.FC<KotlinSourceViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [selectedId, setSelectedId] = useState<string>(ANDROID_FILES[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentFile = ANDROID_FILES.find((f) => f.id === selectedId) ?? ANDROID_FILES[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentFile.content);
      setCopiedId(currentFile.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Clipboard fallback ignored if blocked
    }
  };

  const handleDownload = () => {
    const blob = new Blob([currentFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.fileName.split('/').pop() ?? currentFile.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.kotlinTitle}</h1>
          <p className="mt-1 text-sm text-slate-600">{t.kotlinSubtitle}</p>
        </div>
        <div className="text-xs font-mono text-slate-500">
          Kotlin 2.1 · Jetpack Compose · minSdk 29 (Android 10+)
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* File Tree Sidebar */}
        <aside className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-3.5 text-xs font-semibold text-slate-500">
            android/
          </div>
          <div className="divide-y divide-slate-100">
            {ANDROID_FILES.map((file) => {
              const active = file.id === currentFile.id;
              return (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => setSelectedId(file.id)}
                  className={`w-full text-left px-5 py-3.5 transition-colors cursor-pointer ${
                    active ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileCode2
                      className={`h-4 w-4 shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`}
                    />
                    <span
                      className={`text-sm font-mono font-medium truncate ${
                        active ? 'text-blue-700' : 'text-slate-900'
                      }`}
                    >
                      {file.fileName}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2 pl-6">
                    {language === 'bn' ? file.summaryBn : file.summaryEn}
                  </p>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Source Code Pane */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3.5">
            <div className="min-w-0">
              <div className="text-sm font-mono font-semibold text-slate-900 truncate">
                {currentFile.relativePath}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {language === 'bn' ? currentFile.summaryBn : currentFile.summaryEn}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer whitespace-nowrap"
              >
                {copiedId === currentFile.id ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{t.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>{t.copyCode}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 cursor-pointer whitespace-nowrap"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{t.downloadFile}</span>
              </button>
            </div>
          </div>

          <pre className="max-h-[640px] overflow-auto bg-slate-950 p-5 text-xs leading-relaxed text-slate-100 font-mono">
            <code>{currentFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
