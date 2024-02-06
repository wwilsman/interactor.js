import { use, configure, run } from 'moonshiner';
import reporters from 'moonshiner/reporters';

use(reporters.remote());
configure({ timeout: 10_000 });

import('./**/*.test.js').then(run);
