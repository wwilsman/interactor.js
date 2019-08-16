import { $, $$ } from './utils/dom';
import isInteractor from './utils/is-interactor';
import { getAssertFor } from './utils/assert';
import makeChainable from './utils/chainable';
import meta, { get, set } from './utils/meta';
import { runAssertion, runCallback } from './utils/run';

const {
  now
} = Date;
const {
  assign,
  defineProperty,
  freeze
} = Object;

export default class Interactor {
  static isInteractor = isInteractor;

  constructor(options = {}, previous = {}) {
    // a scope selector, element, or function was given
    if (typeof options === 'string' ||
        options instanceof Element ||
        typeof options === 'function') {
      options = { scope: options };

    // a timeout was provided
    } else if (typeof options === 'number') {
      options = { timeout: options };
    }

    // gather options
    let {
      scope,
      parent,
      chain = false,
      detached = false,
      timeout = 2000
    } = assign({}, get(previous), options);

    // intereactor queue
    let queue = (get(previous, 'queue') || [])
      .concat(options.queue || []);

    // assert options
    let assert = freeze(
      assign({
        expected: true,
        format: '%s assertion failed: %e',
        remains: false,
        validations: []
      }, (
        options.assert !== null &&
          get(previous, 'assert')
      ), (
        options.assert
      ))
    );

    // define meta properties for this instance
    defineProperty(this, meta, {
      enumerable: false,
      configurable: true,
      value: freeze({
        scope,
        parent,
        detached,
        timeout,
        assert,
        queue
      })
    });

    if (parent && chain) {
      // given a parent, make all methods and getters return
      // parent-chainable instances of themselves
      makeChainable(this);
    } else {
      // build assert object for top level instances
      defineProperty(this, 'assert', {
        enumerable: false,
        configurable: true,
        value: getAssertFor(this)
      });
    }
  }

  get $dom() {
    // lazy for virtual DOMs
    return window;
  }

  get $element() {
    let { scope, parent, detached } = get(this);
    let nested = !detached && parent;

    try {
      // evaluate scope or set to default when not nested
      scope = (typeof scope === 'function' ? scope() : scope) ||
        (!nested && (this.constructor.defaultScope || this.$dom.document.body));

      return $(scope, nested ? parent.$element : this.$dom.document);
    } catch (err) {
      // allow errors from scope functions to bubble through negated assertions
      err[meta] = true;
      throw err;
    }
  }

  $(selector) {
    return $(selector, this.$element);
  }

  $$(selector) {
    return $$(selector, this.$element);
  }

  timeout(timeout) {
    if (typeof timeout !== 'undefined') {
      return set(this, { timeout });
    } else {
      return get(this, 'timeout');
    }
  }

  when(assertion) {
    return set(this.assert.validate(), {
      queue: [{ assertion }]
    });
  }

  always(assertion, timeout) {
    return set(this.assert.validate(), {
      queue: [{
        always: true,
        assertion,
        timeout
      }]
    });
  }

  do(callback) {
    return set(this.assert.validate(), {
      queue: [{ callback }]
    });
  }

  append(interactor) {
    if (!isInteractor(interactor)) {
      throw new Error(`expected an interactor instance, instead recieved "${interactor}"`);
    }

    let { assert, queue } = get(interactor);
    let next = this;

    if (queue.length) {
      next = set(next.assert.validate(), {
        // provide context to appended queue items
        queue: queue.map(item => ({
          ctx: interactor,
          ...item
        }))
      });
    }

    if (assert.validations.length) {
      let { validations } = get(next, 'assert');

      next = set(next, 'assert', {
        expected: assert.expected,
        validations: validations.concat(
          // provide context to appended validations
          assert.validations.map(matcher => ({
            ctx: interactor,
            ...matcher
          }))
        )
      });
    }

    return next;
  }

  run() {
    let next = this.assert.validate();
    let { timeout, queue } = get(next);
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

      return promise.then(() => {
        /* istanbul ignore else: unnecessary */
        if (subject.assertion) {
          return runAssertion(next, subject, stats);
        } else if (subject.callback) {
          return runCallback(next, subject, stats);
        }
      });
    }, Promise.resolve());
  }

  then() {
    // resolve to undefined
    let promise = this.run().then(() => {});
    // pass promise arguments onward
    return promise.then.apply(promise, arguments);
  }
}
