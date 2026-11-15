import { Language, SignalQuality } from '../types/wifi';

export const TRANSLATIONS: Record<
  Language,
  {
    brand: string;
    navPreview: string;
    navKotlin: string;
    navSetup: string;
    scanButton: string;
    scanningButton: string;
    detectedLabel: (count: number) => string;
    allBands: string;
    searchPlaceholder: string;
    addHidden: string;
    availableNetworksTitle: string;
    availableNetworksSubtitle: string;
    connectedBadge: string;
    tapToConnect: string;
    openNetwork: string;
    signalMonitorTitle: string;
    noActiveConnectionTitle: string;
    noActiveConnectionBody: string;
    disconnect: string;
    forgetNetwork: string;
    signalStrengthLabel: string;
    linkSpeedLabel: string;
    frequencyLabel: string;
    ipAddressLabel: string;
    bssidLabel: string;
    distanceSimulatorLabel: string;
    distanceUnit: (meters: number) => string;
    signalHistoryTitle: string;
    qualityLabels: Record<SignalQuality, string>;
    connectModalTitle: (ssid: string) => string;
    passwordLabel: string;
    passwordPlaceholder: string;
    rememberNetwork: string;
    fillDemoKey: string;
    demoKeyHint: (key: string) => string;
    connectAction: string;
    connectingAction: string;
    cancel: string;
    authStepAuthenticating: string;
    authStepDhcp: string;
    wrongPasswordError: string;
    shortPasswordError: string;
    hiddenModalTitle: string;
    ssidLabel: string;
    ssidPlaceholder: string;
    securityLabel: string;
    kotlinTitle: string;
    kotlinSubtitle: string;
    copyCode: string;
    copied: string;
    downloadFile: string;
    setupTitle: string;
    setupSubtitle: string;
    browserNoteTitle: string;
    browserNoteBody: string;
    savedCountLabel: (count: number) => string;
    savedNetworksTitle: string;
    noSavedNetworks: string;
    browserLinkTitle: string;
    onlineLabel: string;
    offlineLabel: string;
    notSupportedLabel: string;
  }
> = {
  en: {
    brand: 'AirLink',
    navPreview: 'Android Preview',
    navKotlin: 'Kotlin Source',
    navSetup: 'Android Studio Guide',
    scanButton: 'Scan Wi-Fi',
    scanningButton: 'Scanning...',
    detectedLabel: (count) => `${count} Wi-Fi signals found`,
    allBands: 'All Bands',
    searchPlaceholder: 'Filter by SSID or router...',
    addHidden: 'Join Hidden',
    availableNetworksTitle: 'Available Wi-Fi Networks',
    availableNetworksSubtitle: 'Select any network below to enter its password and connect',
    connectedBadge: 'Connected',
    tapToConnect: 'Select',
    openNetwork: 'Open',
    signalMonitorTitle: 'Live Signal Strength',
    noActiveConnectionTitle: 'Not connected to Wi-Fi',
    noActiveConnectionBody:
      'Tap any Wi-Fi network from the scanned list and enter its password to connect and monitor live dBm signal strength.',
    disconnect: 'Disconnect',
    forgetNetwork: 'Forget',
    signalStrengthLabel: 'Signal Strength',
    linkSpeedLabel: 'Link Speed',
    frequencyLabel: 'Band & Channel',
    ipAddressLabel: 'Local IPv4',
    bssidLabel: 'BSSID (MAC)',
    distanceSimulatorLabel: 'Distance from Router (Test Signal Drop)',
    distanceUnit: (m) => `${m} m`,
    signalHistoryTitle: 'Live RSSI Signal History (30s)',
    qualityLabels: {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      weak: 'Weak',
    },
    connectModalTitle: (ssid) => `Connect to ${ssid}`,
    passwordLabel: 'Wi-Fi Password',
    passwordPlaceholder: 'Enter 8+ character WPA password',
    rememberNetwork: 'Save network profile',
    fillDemoKey: 'Use Demo Password',
    demoKeyHint: (key) => `Demo key for testing: ${key}`,
    connectAction: 'Connect',
    connectingAction: 'Connecting...',
    cancel: 'Cancel',
    authStepAuthenticating: 'Verifying WPA2/WPA3 passphrase...',
    authStepDhcp: 'Obtaining IP address via DHCP...',
    wrongPasswordError: 'Incorrect password. WPA authentication failed.',
    shortPasswordError: 'Password must be at least 8 characters for WPA2/WPA3.',
    hiddenModalTitle: 'Join Hidden Wi-Fi Network',
    ssidLabel: 'Network Name (SSID)',
    ssidPlaceholder: 'Enter exact SSID',
    securityLabel: 'Security Protocol',
    kotlinTitle: 'Native Android Kotlin & Jetpack Compose Source',
    kotlinSubtitle:
      'Complete Android Studio project using WifiManager, WifiNetworkSpecifier, and Material 3 (no HTML/WebView).',
    copyCode: 'Copy Code',
    copied: 'Copied',
    downloadFile: 'Download File',
    setupTitle: 'How to Build & Run on Your Android Phone',
    setupSubtitle:
      'Why this web preview simulates the UI and how to compile the real Kotlin Android APK in Android Studio.',
    browserNoteTitle: 'Web Preview vs. Real Android APK',
    browserNoteBody:
      'This browser window runs an interactive preview of your Android UI. Real Kotlin compilation and hardware Wi-Fi radio control require Android Studio on your computer, because web browsers cannot run Kotlin or modify OS Wi-Fi connections.',
    savedCountLabel: (c) => `${c} saved`,
    savedNetworksTitle: 'Saved Networks',
    noSavedNetworks: 'No saved Wi-Fi passwords yet',
    browserLinkTitle: 'Host Browser Link (Real API)',
    onlineLabel: 'Online',
    offlineLabel: 'Offline',
    notSupportedLabel: 'Unavailable in this browser',
  },
  bn: {
    brand: 'AirLink',
    navPreview: 'অ্যান্ড্রয়েড প্রিভিউ',
    navKotlin: 'Kotlin কোড',
    navSetup: 'Android Studio গাইড',
    scanButton: 'Wi-Fi স্ক্যান করুন',
    scanningButton: 'স্ক্যান হচ্ছে...',
    detectedLabel: (count) => `${count}টি Wi-Fi সিগন্যাল পাওয়া গেছে`,
    allBands: 'সব ব্যান্ড',
    searchPlaceholder: 'Wi-Fi নাম (SSID) দিয়ে খুঁজুন...',
    addHidden: 'Hidden Wi-Fi',
    availableNetworksTitle: 'আশেপাশের Wi-Fi নেটওয়ার্ক',
    availableNetworksSubtitle: 'কানেক্ট করতে নিচের যেকোনো Wi-Fi সিলেক্ট করে পাসওয়ার্ড দিন',
    connectedBadge: 'কানেক্টেড',
    tapToConnect: 'সিলেক্ট',
    openNetwork: 'পাসওয়ার্ড ছাড়া',
    signalMonitorTitle: 'লাইভ সিগন্যাল স্ট্রেংথ',
    noActiveConnectionTitle: 'কোনো Wi-Fi কানেক্ট করা নেই',
    noActiveConnectionBody:
      'বাম পাশের তালিকা থেকে একটি Wi-Fi সিলেক্ট করে পাসওয়ার্ড দিলে কানেক্ট হবে এবং সাথে সাথে লাইভ সিগন্যাল স্ট্রেংথ দেখাবে।',
    disconnect: 'ডিসকানেক্ট',
    forgetNetwork: 'ভুলে যান',
    signalStrengthLabel: 'সিগন্যাল স্ট্রেংথ',
    linkSpeedLabel: 'লিংক স্পিড',
    frequencyLabel: 'ব্যান্ড ও চ্যানেল',
    ipAddressLabel: 'লোকাল IPv4',
    bssidLabel: 'BSSID (MAC)',
    distanceSimulatorLabel: 'রাউটার থেকে দূরত্ব (সিগন্যাল টেস্ট করুন)',
    distanceUnit: (m) => `${m} মিটার`,
    signalHistoryTitle: 'লাইভ RSSI সিগন্যাল গ্রাফ (৩০ সেকেন্ড)',
    qualityLabels: {
      excellent: 'খুব ভালো (Excellent)',
      good: 'ভালো (Good)',
      fair: 'মাঝারি (Fair)',
      weak: 'দুর্বল (Weak)',
    },
    connectModalTitle: (ssid) => `${ssid}-এ কানেক্ট করুন`,
    passwordLabel: 'Wi-Fi পাসওয়ার্ড',
    passwordPlaceholder: 'কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড দিন',
    rememberNetwork: 'পাসওয়ার্ড সেভ করে রাখুন',
    fillDemoKey: 'ডেমো পাসওয়ার্ড বসান',
    demoKeyHint: (key) => `টেস্ট করার ডেমো পাসওয়ার্ড: ${key}`,
    connectAction: 'কানেক্ট করুন',
    connectingAction: 'কানেক্ট হচ্ছে...',
    cancel: 'বাতিল',
    authStepAuthenticating: 'পাসওয়ার্ড যাচাই করা হচ্ছে (WPA2/WPA3)...',
    authStepDhcp: 'IP অ্যাড্রেস নেওয়া হচ্ছে...',
    wrongPasswordError: 'ভুল পাসওয়ার্ড! কানেক্ট করা যায়নি।',
    shortPasswordError: 'WPA2/WPA3 পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।',
    hiddenModalTitle: 'Hidden Wi-Fi নেটওয়ার্কে যুক্ত হোন',
    ssidLabel: 'Wi-Fi নাম (SSID)',
    ssidPlaceholder: 'সঠিক SSID লিখুন',
    securityLabel: 'সিকিউরিটি টাইপ',
    kotlinTitle: 'Native Android Kotlin ও Jetpack Compose কোড',
    kotlinSubtitle:
      'সম্পূর্ণ অ্যান্ড্রয়েড স্টুডিও প্রজেক্ট (WifiManager + WifiNetworkSpecifier + Material 3, কোনো HTML নয়)।',
    copyCode: 'কোড কপি করুন',
    copied: 'কপি হয়েছে',
    downloadFile: 'ফাইল ডাউনলোড',
    setupTitle: 'কীভাবে Android Studio দিয়ে আসল ফোনে চালাবেন',
    setupSubtitle:
      'কেন ব্রাউজারে আসল APK রান হয় না এবং কীভাবে এই Kotlin কোড দিয়ে নিজের ফোনে APK বানাবেন।',
    browserNoteTitle: 'ব্রাউজার প্রিভিউ বনাম আসল Android অ্যাপ',
    browserNoteBody:
      'এই প্রিভিউটি শুধুমাত্র ডিজাইন ও ফ্লো দেখানোর জন্য। আসল ফোনে Wi-Fi স্ক্যান ও পাসওয়ার্ড দিয়ে কানেক্ট করতে Kotlin কোড ট্যাব থেকে ফাইলগুলো নিয়ে Android Studio-তে বিল্ড করতে হবে।',
    savedCountLabel: (c) => `${c}টি সেভ করা`,
    savedNetworksTitle: 'সেভ করা নেটওয়ার্ক',
    noSavedNetworks: 'এখনো কোনো Wi-Fi সেভ করা হয়নি',
    browserLinkTitle: 'বর্তমান ব্রাউজার নেটওয়ার্ক (রিয়েল API)',
    onlineLabel: 'অনলাইন',
    offlineLabel: 'অফলাইন',
    notSupportedLabel: 'এই ব্রাউজারে সাপোর্ট নেই',
  },
};
