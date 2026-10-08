import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
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
});
