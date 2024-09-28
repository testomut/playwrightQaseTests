import { defineConfig, devices } from '@playwright/test';

require('dotenv').config();

export default defineConfig({
  timeout: 200000,
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
            "size": 5
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
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    permissions: ['microphone'],
    headless: true
  },
  
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
  ],
});
