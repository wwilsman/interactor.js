import { rollup } from 'moonshiner/bundler/rollup';
import { test as config } from '../rollup.config.js';

// Moonshiner needs a host coverage map to collect coverage from the browser.
globalThis.__coverage__ ??= {};

export default {
  browser: 'Chrome',
  timeout: 10_000,
  plugins: [
    rollup(config)
  ]
};
