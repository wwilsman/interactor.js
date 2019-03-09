import Convergence from './convergence';
import { $, $$ } from './utils/dom';
import isInteractor from './utils/is-interactor';
import { createAssertions, getAssertFor } from './utils/assertions';
import makeChainable from './utils/chainable';
import extend from './utils/extend';
import from, { wrap } from './utils/from';
import meta, { get } from './utils/meta';

import * as assertions from './assertions';
import * as actions from './actions';
import * as properties from './properties';
import scoped from './helpers/scoped';

const {
  assign,
  defineProperty,
  defineProperties,
  entries,
  freeze
} = Object;

class Interactor extends Convergence {
  static isInteractor = isInteractor;

  // default `document.body` scope is lazy for fake DOM enviroments
  static get defaultScope() { return document.body; };

  // ensure these are always bound to their respective classes
  static get extend() { return extend.bind(this); };
  static get from() { return from.bind(this); };

  constructor(options = {}, previous = {}) {
    // a scope selector, element, or function was given
    if (typeof options === 'string' ||
        options instanceof Element ||
        typeof options === 'function') {
      options = { scope: options };

      // convergence timeout was provided
    } else if (typeof options === 'number') {
      options = { timeout: options };
    }

    // convergence super
    super(options, previous);

    // gather options
    let {
      scope,
      parent,
      chain = false,
      detached = true
    } = assign({}, get(previous), options);

    let assert = assign({
      expected: true,
      format: 'Failed validating %s: %e',
      remains: false,
      validations: []
    }, (
      options.assert !== null &&
        get(previous, 'assert')
    ), (
      options.assert
    ));

    // define meta properties for this instance
    defineProperty(this, meta, {
      enumerable: false,
      configurable: true,
      value: freeze(assign({
        scope,
        parent,
        detached,
        assert
      }, get(this)))
    });

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

  get $element() {
    let { scope, parent, detached } = get(this);
    let nested = !detached && parent;

    scope = typeof scope === 'function' ? scope() : scope;
    scope = scope || (!nested && this.constructor.defaultScope);

    return $(scope, nested ? parent.$element : undefined);
  }

  $(selector) {
    return $(selector, this.$element);
  }

  $$(selector) {
    return $$(selector, this.$element);
  }

  when(fn) {
    let next = this.assert.validate();
    return super.when.call(next, withElement(fn));
  }

  always(fn, timeout) {
    let next = this.assert.validate();
    return super.always.call(next, withElement(fn), timeout);
  }

  do(fn) {
    let next = this.assert.validate();
    return super.do.call(next, withElement(fn));
  }

  run() {
    let next = this.assert.validate();
    return super.run.call(next);
  }
}

function withElement(fn) {
  return function([element, ...args] = []) {
    if (!element && fn.length > 0) element = this.$element;
    return fn.call(this, element, ...args);
  };
}

// define computed properties
defineProperties(
  Interactor.prototype,
  entries(
    properties
  ).reduce((descriptors, [name, creator]) => {
    return assign(descriptors, {
      [name]: creator()
    });
  }, {})
);

// default actions / methods
defineProperties(
  Interactor.prototype,
  entries({
    ...actions,
    scoped
  }).reduce((descriptors, [name, method]) => {
    return assign(descriptors, {
      [name]: {
        value: wrap(method)
      }
    });
  }, {})
);

// define assertions
defineProperty(Interactor.prototype, 'assert', {
  value: createAssertions(assertions)
});

export default Interactor;
