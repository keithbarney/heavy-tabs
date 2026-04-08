import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config for heavy-tabs e2e tests.
 *
 * Auth pattern: captured storageState. Heavy Tabs is fully passwordless
 * (Google OAuth), so we can't programmatically sign in. Instead, run
 * `npm run test:e2e:capture` once to sign in manually, which saves
 * .playwright/storageState.json. All tests reuse that state.
 *
 * Re-capture only when the Supabase refresh token expires (rare).
 *
 * Two projects: desktop chromium and mobile (iPhone 13). Tests in
 * core.spec.ts run on both. Tests tagged @mobile or @desktop run on one.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list']],

  use: {
    baseURL: 'http://localhost:3002',
    storageState: '.playwright/storageState.json',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      // Pixel 5 is chromium-based (390×844 viewport, like iPhone 13).
      // Avoids the webkit dependency that ships with iPhone presets.
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
