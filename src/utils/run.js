import isConvergence from './is-convergence';
import { when, always } from './converge-on';

const { now } = Date;
const { min, max } = Math;

function getElapsedSince(start, timeout) {
  let elapsed = now() - start;

  // we shouldn't continue beyond the timeout
  if (elapsed >= timeout) {
    throw new Error(`convergence exceeded the ${timeout}ms timeout`);
  }

  return elapsed;
};

function collectStats(accumulator, stats, ret) {
  accumulator.runs += stats.runs;
  accumulator.elapsed += stats.elapsed;
  accumulator.end = stats.end;
  accumulator.value = stats.value;
  accumulator.queue.push(stats);

  return typeof stats.value !== 'undefined'
    ? stats.value : ret;
}

export function runAssertion(context, subject, arg, stats) {
  let timeout = stats.timeout - getElapsedSince(stats.start, stats.timeout);
  let assertion = subject.assertion.bind(context, arg);
  let converge = subject.always ? always : when;

  // always defaults to one-tenth or the remaining timeout
  if (subject.always) {
    if (subject.timeout) {
      // ensure the timeout is shorter than the remaining
      timeout = min(timeout, subject.timeout);
    } else if (!subject.last) {
      // default to one-tenth the total, minimum 20ms
      timeout = max(stats.timeout / 10, 20);
    }
  }

  return converge(assertion, timeout)
  // incorporate stats and curry the assertion return value
    .then((convergeStats) => collectStats(stats, convergeStats, arg));
}

export function runCallback(context, subject, arg, stats) {
  let start = now();
  let result = subject.callback.call(context, arg);

  let collectExecStats = value => {
    return collectStats(stats, {
      start,
      runs: 1,
      end: now(),
      elapsed: getElapsedSince(start, stats.timeout),
      value
    }, arg);
  };

  // a convergence is called with the current remaining timeout
  if (isConvergence(result)) {
    let timeout = stats.timeout - getElapsedSince(start, stats.timeout);

    if (!subject.last) {
      // this .do() just prevents the last .always() from
      // using the entire timeout
      result = result.do(ret => ret);
    }

    return result.timeout(timeout).run()
    // incorporate stats and curry the return value
      .then(convergeStats => collectStats(stats, convergeStats, arg));

  // a promise will need to settle first
  } else if (result && typeof result.then === 'function') {
    return result.then(collectExecStats);

  // any other result is just returned
  } else {
    return collectExecStats(result);
  }
}
