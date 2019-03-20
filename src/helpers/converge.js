const { now } = Date;

function convergeOn(assertion, timeout, always) {
  let start = now();
  let interval = 10;
  let bail = false;

  // track various stats
  let stats = {
    start,
    runs: 0,
    end: start,
    elapsed: 0,
    always,
    timeout,
    value: undefined
  };

  return new Promise((resolve, reject) => {
    (function loop() {
      // track stats
      stats.runs += 1;

      try {
        let results = assertion();

        // a promise means there could be side-effects; bail
        if (results && typeof results.then === 'function') {
          bail = true;

          throw new Error(
            'convergent assertion encountered a async function or promise; ' +
            'since convergent assertions can run multiple times, you should ' +
            'avoid introducing side-effects inside of them'
          );
        }

        // the timeout calculation comes after the assertion so that
        // the assertion's execution time is accounted for
        let doLoop = now() - start < timeout;

        if (always && doLoop) {
          setTimeout(loop, interval);
        } else if (results === false) {
          throw new Error('convergent assertion returned `false`');
        } else if (!always && !doLoop) {
          throw new Error(
            'convergent assertion was successful, ' +
            `but exceeded the ${timeout}ms timeout`
          );
        } else {
          // calculate some stats right before resolving with them
          stats.end = now();
          stats.elapsed = stats.end - start;
          stats.value = results;
          resolve(stats);
        }
      } catch (error) {
        let doLoop = now() - start < timeout;

        /* istanbul ignore else: unnecessary */
        if (!bail && !always && doLoop) {
          setTimeout(loop, interval);
        } else if (bail || always || !doLoop) {
          reject(error);
        }
      }
    })();
  });
}

function thennable(fn) {
  return Object.defineProperty(fn, 'then', {
    value: (...args) => fn().then(...args)
  });
}

export function when(assertion, timeout = 2000) {
  return thennable(() => convergeOn(assertion, timeout, false));
}

export function always(assertion, timeout = 200) {
  return thennable(() => convergeOn(assertion, timeout, true));
}
