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
        format: 'Failed validating %s: %e',
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

    // build assert object for this instance
    defineProperty(this, 'assert', {
      enumerable: false,
      configurable: true,
      value: getAssertFor(this)
    });

    // given a parent, make all methods and getters return
    // parent-chainable instances of themselves
    if (parent && chain) {
      makeChainable(this);
    }
  }

  get $dom() {
    // lazy for virtual DOMs
    return window;
  }

  get $element() {
    let { scope, parent, detached } = get(this);
    let nested = !detached && parent;

    // evaluate scope or set to default when not nested
    scope = (typeof scope === 'function' ? scope() : scope) ||
      (!nested && (this.constructor.defaultScope || this.$dom.document.body));

    return $(scope, nested ? parent.$element : this.$dom.document);
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

    return set(this.assert.validate(), {
      queue: get(interactor, 'queue')
    });
  }

  run() {
    let { timeout, queue } = get(this.assert.validate());
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
          return runAssertion(this, subject, stats);
        } else if (subject.callback) {
          return runCallback(this, subject, stats);
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
