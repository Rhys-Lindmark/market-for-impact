import { defineConfig } from '@playwright/test';

const externalBaseUrl = process.env.MOBILE_AUDIT_BASE_URL;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: externalBaseUrl ?? 'http://localhost:3107',
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
  webServer: externalBaseUrl ? undefined : {
    command: 'npm run dev -- --port 3107',
    url: 'http://localhost:3107',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: 'phone-390', use: { viewport: { width: 390, height: 844 } } },
    { name: 'tablet-768', use: { viewport: { width: 768, height: 1024 } } },
  ],
});
