import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    // The native iPhone/iPad app ships its pages inside the app, so it needs no service worker.
    mode !== 'native' &&
      // Installable app: manifest + service worker that caches the app shell for offline loading.
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'apple-touch-icon.png'],
        manifest: {
          name: 'Bio Bites — Interactive Biology',
          short_name: 'Bio Bites',
          description:
            'Learn biology by playing with it: hands-on lessons, mysteries and collectible avatars.',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'any',
          background_color: '#fff9ef',
          theme_color: '#10b981',
          categories: ['education', 'games'],
          icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
            {
              src: '/icon-maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
            { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
          ],
          shortcuts: [
            {
              name: 'Library',
              url: '/library',
              icons: [{ src: '/icon-192.png', sizes: '192x192' }],
            },
            {
              name: 'Bio Mysteries',
              url: '/mysteries',
              icons: [{ src: '/icon-192.png', sizes: '192x192' }],
            },
            { name: 'Shop', url: '/shop', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          // Client-side routes load the app shell offline; API calls always go to the network
          // (the player store already queues progress made offline).
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
  ],
  build: {
    outDir: mode === 'native' ? 'dist-native' : 'dist',
    // The concept library (154 lessons of data) ships in one chunk so search is instant;
    // it compresses to about 200 kB gzipped.
    chunkSizeWarningLimit: 700,
  },
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:3001' },
  },
  test: {
    environment: 'jsdom',
    passWithNoTests: true,
  },
}));
