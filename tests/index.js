import { use, configure, run } from 'moonshiner';
import reporters from 'moonshiner/reporters';
import middlewares from 'moonshiner/middlewares';

use(reporters.remote());
use(middlewares.bind(globalThis));

configure({ timeout: 10_000 });

import('./**/*.test.js')
  .then(() => run());
