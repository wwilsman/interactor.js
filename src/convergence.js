import isConvergence from './utils/is-convergence';
import { runAssertion, runCallback } from './utils/run';
import meta, { set, get } from './utils/meta';

const {
  now
} = Date;
const {
  assign,
  defineProperty,
  freeze
} = Object;

export default class Convergence {
  static isConvergence = isConvergence;

  constructor(options = {}, previous = {}) {
    // a timeout was provided
    if (typeof options === 'number') {
      options = { timeout: options };
    }

    // gather options
    let {
      timeout = get(previous, 'timeout') || 2000,
      queue = []
    } = options;

    defineProperty(this, meta, {
      enumerable: false,
      configurable: true,
      value: freeze({
        // merge queues
        queue: (get(previous, 'queue') || []).concat(queue),
        timeout
      })
    });
  }

  timeout(timeout) {
    if (typeof timeout !== 'undefined') {
      return set(this, { timeout });
    } else {
      return get(this, 'timeout');
    }
  }

  when(assertion) {
    return set(this, {
      queue: [{ assertion }]
    });
  }

  always(assertion, timeout) {
    return set(this, {
      queue: [{
        always: true,
        assertion,
        timeout
      }]
    });
  }

  do(callback) {
    return set(this, {
      queue: [{ callback }]
    });
  }

  append(convergence) {
    if (!isConvergence(convergence)) {
      throw new Error('.append() only works with convergence instances');
    }

    return set(this, {
      queue: get(convergence, 'queue')
    });
  }

  run() {
    let { timeout, queue } = get(this);
    let start = now();

    let stats = {
      start,
      runs: 0,
      end: start,
      elapsed: 0,
      value: undefined,
      queue: [],
      timeout
    };

    // reduce to a single promise that runs each item in the queue
    return queue.reduce((promise, subject, i) => {
      // the last subject will receive the remaining timeout
      if (i === (queue.length - 1)) {
        subject = assign({ last: true }, subject);
      }

      return promise.then(ret => {
        /* istanbul ignore else: unnecessary */
        if (subject.assertion) {
          return runAssertion(this, subject, ret, stats);
        } else if (subject.callback) {
          return runCallback(this, subject, ret, stats);
        }
      });
    }, Promise.resolve())
      // always resolve with the stats object
      .then(() => stats);
  }

  then() {
    // resolve with the value of the last function in the queue
    let promise = this.run().then(({ value }) => value);
    // pass promise arguments onward
    return promise.then.apply(promise, arguments);
  }
}
