import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

/** Smoke tests run against the production build, served by the real API server with a throwaway database. */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, grepInvert: /@mobile/ },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, grep: /@mobile/ },
  ],
  webServer: {
    command: `rm -rf .e2e-data && VITE_SHOW_DEMO_LOGIN=on npm run build && PORT=${PORT} DATABASE_PATH=../.e2e-data/e2e.db DEMO_ACCOUNT=on npm start`,
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
