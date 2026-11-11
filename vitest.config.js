import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  resolve: {
    alias: {
      'interactor.js': fileURLToPath(new URL('./lib/index.js', import.meta.url))
    }
  },
  test: {
    include: ['tests/**/*.test.js'],
    testTimeout: 10_000,
    fileParallelism: false,
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      headless: true,
      viewport: { width: 1280, height: 720 }
    },
    coverage: {
      provider: 'istanbul',
      include: ['lib/**/*.js'],
      reporter: ['text-summary', 'lcov'],
      thresholds: {
        branches: 100,
        lines: 100,
        functions: 100,
        statements: 100
      }
    }
  }
});
