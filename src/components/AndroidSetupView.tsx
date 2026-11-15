import React from 'react';
import { Language } from '../types/wifi';
import { TRANSLATIONS } from '../i18n/translations';

interface AndroidSetupViewProps {
  language: Language;
  onOpenKotlinSource: () => void;
}

export const AndroidSetupView: React.FC<AndroidSetupViewProps> = ({
  language,
  onOpenKotlinSource,
}) => {
  const t = TRANSLATIONS[language];
  const isBn = language === 'bn';

  const steps = isBn
    ? [
        {
          title: '০১. Android Studio ইন্সটল ও নতুন প্রজেক্ট তৈরি করুন',
          body: 'আপনার পিসিতে Android Studio (Ladybug বা নতুন ভার্সন) ওপেন করে "New Project → Empty Activity (Jetpack Compose)" সিলেক্ট করুন। Package name দিন com.airlink.wifi এবং Minimum SDK দিন API 29 (Android 10)।',
        },
        {
          title: '০২. Kotlin কোড ও Manifest কপি করুন',
          body: 'উপরের "Kotlin কোড" ট্যাব থেকে MainActivity.kt, WifiController.kt, WifiViewModel.kt, WifiModels.kt, AndroidManifest.xml এবং build.gradle.kts ফাইলগুলো আপনার Android Studio প্রজেক্টে পেস্ট করুন।',
        },
        {
          title: '০৩. আসল Android ফোনে USB Debugging চালু করে রান করুন',
          body: 'ফোনের Settings → Developer Options → USB Debugging অন করে পিসির সাথে কানেক্ট করুন। Android Emulator-এ আসল আশেপাশের Wi-Fi হার্ডওয়্যার থাকে না, তাই আসল ফোনে টেস্ট করাই সবচেয়ে ভালো।',
        },
        {
          title: '০৪. লোকেশন ও Wi-Fi পারমিশন Allow করুন',
          body: 'Android 10–12 এ আশেপাশের Wi-Fi স্ক্যান ও RSSI দেখার জন্য Fine Location পারমিশন এবং Android 13+ এ NEARBY_WIFI_DEVICES পারমিশন Allow করতে হবে (এবং ফোনের GPS/Location চালু থাকতে হবে)।',
        },
      ]
    : [
        {
          title: '01. Create a Jetpack Compose Project in Android Studio',
          body: 'Open Android Studio (Ladybug or newer), choose "New Project → Empty Activity", set the package name to com.airlink.wifi, and set Minimum SDK to API 29 (Android 10) for WifiNetworkSpecifier support.',
        },
        {
          title: '02. Copy the Native Kotlin & Manifest Files',
          body: 'Switch to the "Kotlin Source" tab above and copy MainActivity.kt, WifiController.kt, WifiViewModel.kt, WifiModels.kt, AndroidManifest.xml, and app/build.gradle.kts into your Android Studio module.',
        },
        {
          title: '03. Run on a Physical Android Phone',
          body: 'Enable USB Debugging on your Android device and click Run in Android Studio. Physical devices expose real nearby Wi-Fi radios and dBm signal measurements, whereas emulators only provide a virtual router.',
        },
        {
          title: '04. Grant Location & Nearby Wi-Fi Permissions',
          body: 'Android 10–12 requires Fine Location (with device Location turned on) to read scan results and RSSI, while Android 13+ uses NEARBY_WIFI_DEVICES. The app requests these automatically on launch.',
        },
      ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.setupTitle}</h1>
        <p className="mt-1 text-sm text-slate-600">{t.setupSubtitle}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
        <h2 className="text-base font-semibold text-slate-900">{t.browserNoteTitle}</h2>
        <p className="text-sm leading-relaxed text-slate-600">{t.browserNoteBody}</p>
        <div className="pt-1">
          <button
            type="button"
            onClick={onOpenKotlinSource}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 cursor-pointer"
          >
            {t.navKotlin}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((step) => (
          <div key={step.title} className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-slate-900">
          {isBn
            ? 'Android API নোট: WifiNetworkSpecifier বনাম WifiNetworkSuggestion'
            : 'Android API Note: WifiNetworkSpecifier vs. WifiNetworkSuggestion'}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {isBn
            ? 'WifiController.kt ফাইলে WifiNetworkSpecifier ব্যবহার করা হয়েছে, যা অ্যাপের ভেতর থেকে সরাসরি সিলেক্ট করা Wi-Fi নেটওয়ার্কে কানেক্ট করে এবং লাইভ সিগন্যাল স্ট্রেংথ (dBm) পড়তে দেয়। আপনি যদি চান ফোনের System Wi-Fi সেটিংসেও পাসওয়ার্ড সেভ হয়ে থাকুক, তাহলে Android-এর WifiNetworkSuggestion.Builder() ব্যবহার করতে পারেন।'
            : 'WifiController.kt uses WifiNetworkSpecifier (Android 10+) to connect directly to a selected SSID with its WPA2/WPA3 passphrase and stream live RSSI dBm via ConnectivityManager.NetworkCallback. If you also want networks saved persistently in Android System Settings for general internet routing after closing the app, pair it with WifiNetworkSuggestion.Builder().'}
        </p>
      </div>
    </div>
  );
};
