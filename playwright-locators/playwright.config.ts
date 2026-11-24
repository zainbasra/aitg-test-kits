import { defineConfig } from '@playwright/test';
// Target: AITG Demo Shop (https://demo.aitestingguide.com/shop/). Override with BASE_URL to use a local copy.
const baseURL = process.env.BASE_URL ?? 'https://demo.aitestingguide.com/shop/';
export default defineConfig({
  testDir: './tests',
  timeout: 15_000,
  expect: { timeout: 5_000 },
  use: { baseURL, actionTimeout: 3_000 },
  reporter: [['list']],
  projects: [
    { name: 'normal', metadata: { query: '' } },
    // Same shop with ?rename=1: button text, id and data-testid change, like a refactor.
    { name: 'rename', metadata: { query: '?rename=1' }, testMatch: /rename\.spec\.ts/ },
  ],
});
