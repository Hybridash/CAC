import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.biobites.app',
  appName: 'Bio Bites',
  // `npm run build:native` writes the app's pages here (no service worker, absolute API URL).
  webDir: 'dist-native',
  backgroundColor: '#fff9ef',
  ios: { contentInset: 'never', backgroundColor: '#fff9ef' },
};

export default config;
