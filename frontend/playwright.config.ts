import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  timeout: 30000,
  webServer: [
    {
      command: 'npx tsx src/index.ts',
      port: 3000,
      cwd: '../backend',
      timeout: 30000,
    },
    {
      command: 'npx vite --host 127.0.0.1',
      port: 5173,
      cwd: '.',
      timeout: 30000,
    },
  ],
  use: {
    baseURL: 'http://127.0.0.1:5173',
  },
})
