import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './tests', use: { channel: 'chrome', headless: true, viewport: { width: 1440, height: 1100 } }, reporter: 'list' });
