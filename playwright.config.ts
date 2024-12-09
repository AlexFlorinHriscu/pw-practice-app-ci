import { defineConfig, devices } from '@playwright/test';
import type { TestOptions } from './test-options';

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig<TestOptions>({
  timeout: 40000,
  // globalTimeout: 60000,
  expect: {
    timeout: 2000,
    toMatchSnapshot: {maxDiffPixels: 50}
  },
  
  retries: 1,
  reporter: [
    process.env.CI ? ["dot"] : ["list"],
    [
      "@argos-ci/playwright/reporter",
      {
        // Upload to Argos on CI only.
        uploadToArgos: !!process.env.CI
      },
    ],
    ['json', {outputFile: 'test-results/jsonReport.json'}],
    ['junit', {outputFile: 'test-results/junitReport.xml'}],
    //['allure-playwright'],
    ['html']
  ],

  use: {
    globalsQaURL: 'https://www.globalsqa.com/demo-site/draganddrop/',
    baseURL: process.env.DEV === '1' ? 'http://localhost:4201/'
        : process.env.STAGING === '1' ? 'http://localhost:4202'
        : 'http://localhost:4200',

    trace: 'on-first-retry',
    screenshot: "only-on-failure",
    actionTimeout: 20000,
    navigationTimeout: 25000,
    video: {
      mode: 'off',
      size: {width: 960, height: 540}
    }
  },

  projects: [
    {
      name: 'dev',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:4200/', 
      }
    },
    {
      name: 'chromium'
    },
    {
      name: 'firefox',
      use: { 
        browserName: 'firefox',
        video: {
          mode: 'on',
          size: {width: 960, height: 540}
        }
       }
    },
    {
      name: 'pageObjectFullScreen',
      testMatch: 'usePageObjects.spec.ts',
      use: {
        viewport: {
          width: 1920,
          height: 1080
        }
      }
    },
    {
      name: 'mobile',
      testMatch: 'testMobile.spec.ts',
      use: {
        ...devices['Galaxy S9+']
      }
    }
  ],

  webServer: {
    timeout: 2 * 60 * 1000,
    command: 'npm run start',
    url: 'http://localhost:4200'
  }
});
