import { defineConfig, devices } from '@playwright/test';

require('dotenv').config();

export default defineConfig({
  timeout: 120000,
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.WORKERS || 5,
  reporter: [
    ['list'],
    [
      'playwright-qase-reporter',
      {
        mode: process.env.QASE_MODE || 'testops', 
        debug: false,
        testops: {
          api: {
            token: process.env.QASE_TESTOPS_API_TOKEN,
          },
          project: 'qa_test',
          uploadAttachments: true, 
          batch: {
            "size": 10
          },
          run: {
            title: process.env.QASE_TESTOPS_TITLE || 'Playwright Test Run',
            description: 'https://trace.playwright.dev/',
            complete: false,
            id: process.env.QASE_RUN_ID || undefined,
          },
        },
      },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    permissions: ['microphone'],
    headless: true
  },
  globalSetup: require.resolve('./misc/cacheWarmer.ts'),
  /* Configure projects for major browsers */
  
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 750 },
        httpCredentials: {
          username: String(process.env.BASIC_USERNAME),
          password: String(process.env.BASIC_PASSWORD)
        }
      },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
