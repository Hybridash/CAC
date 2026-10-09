import { Capacitor } from '@capacitor/core';

/** True inside the Bio Bites iPhone/iPad app (as opposed to a browser tab or installed web app). */
export const isNativeApp = Capacitor.isNativePlatform();

/**
 * Where the API lives. The website calls its own server (same origin). The native app bundles its
 * pages inside the app, so it needs the server's full address, set at build time in `.env.native`.
 */
export const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
