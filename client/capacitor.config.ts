import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.biobites.app',
  appName: 'Bio Bites',
  // `npm run build:native` writes the app's pages here (no service worker, absolute API URL).
  webDir: 'dist-native',
  backgroundColor: '#fff9ef',
  ios: { contentInset: 'never', backgroundColor: '#fff9ef' },
  // `npm run ios:live` sets this so the app loads pages from the Vite dev server and updates
  // as files are saved. Without it, the app uses the pages built into it.
  ...(process.env.CAP_LIVE_URL && {
    server: { url: process.env.CAP_LIVE_URL, cleartext: true },
  }),
};

export default config;
