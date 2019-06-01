import isInteractor from './is-interactor';
import { when, always } from '../helpers/converge';

const { now } = Date;
const { min, max } = Math;

function getElapsedSince(start, timeout) {
  let elapsed = now() - start;

  // we shouldn't continue beyond the timeout
  if (elapsed >= timeout) {
    throw new Error(`interactor exceeded the ${timeout}ms timeout`);
  }

  return elapsed;
};

function collectStats(accumulator, stats) {
  accumulator.runs += stats.runs;
  accumulator.elapsed += stats.elapsed;
  accumulator.end = stats.end;
  accumulator.value = stats.value;
  accumulator.queue.push(stats);
  return accumulator;
}

export function runAssertion(context, subject, stats) {
  context = subject.ctx || context;

  let timeout = stats.timeout - getElapsedSince(stats.start, stats.timeout);
  let converge = subject.always ? always : when;

  let assertion = subject.assertion.length
    ? () => subject.assertion.call(context, context.$element)
    : subject.assertion.bind(context);

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
    .then(convergeStats => collectStats(stats, convergeStats));
}

export function runCallback(context, subject, stats) {
  context = subject.ctx || context;

  let start = now();
  let result = subject.callback.length
    ? subject.callback.call(context, context.$element)
    : subject.callback.call(context);

  let collectExecStats = value => {
    return collectStats(stats, {
      start,
      runs: 1,
      end: now(),
      elapsed: getElapsedSince(start, stats.timeout),
      value
    });
  };

  // an interactor is called with the current remaining timeout
  if (isInteractor(result)) {
    let timeout = stats.timeout - getElapsedSince(start, stats.timeout);

    if (!subject.last) {
      // this .do() just prevents the last .always() from
      // using the entire timeout
      result = result.do(() => {});
    }

    return result.timeout(timeout).run()
    // incorporate stats and curry the return value
      .then(convergeStats => collectStats(stats, convergeStats));

  // a promise will need to settle first
  } else if (result && typeof result.then === 'function') {
    return result.then(collectExecStats);

  // any other result is just returned
  } else {
    return collectExecStats(result);
  }
}
