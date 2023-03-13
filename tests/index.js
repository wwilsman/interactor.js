import { use, configure, run } from 'moonshiner';
import reporters from 'moonshiner/reporters';
import middlewares from 'moonshiner/middlewares';

use(reporters.remote(event => Object.assign(event, {
  __coverage__: globalThis.__coverage__
})));

use(middlewares.bind(globalThis));

import('./**/*.test.js').then(() => {
  configure({ timeout: 10_000 });
  run();
});
