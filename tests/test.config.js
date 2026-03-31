import { rollup } from 'moonshiner/bundler/rollup';
import { test as config } from '../rollup.config.js';

export default {
  browser: 'Chrome',
  timeout: 10_000,
  plugins: [
    rollup(config)
  ]
};
