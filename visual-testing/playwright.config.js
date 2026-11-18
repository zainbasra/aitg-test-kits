const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({ testDir: './tests', workers: 1,
  use: { baseURL: 'http://127.0.0.1:8766', launchOptions: process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {} },
  webServer: { command: 'node server.js', url: 'http://127.0.0.1:8766/api/products', reuseExistingServer: true } });
