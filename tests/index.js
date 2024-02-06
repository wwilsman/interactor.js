import { use, configure, run } from 'moonshiner';
import reporters from 'moonshiner/reporters';

use(reporters.remote(event => Object.assign(event, {
  __coverage__: globalThis.__coverage__
})));

import('./**/*.test.js').then(() => {
  configure({ timeout: 10_000 });
  run();
});
