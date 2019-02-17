import Convergence from './convergence';
import { $, $$ } from './utils/dom';
import isInteractor from './utils/is-interactor';
import makeChainable from './utils/chainable';
import { validator } from './utils/validation';
import extend from './utils/extend';
import from, { wrap } from './utils/from';
import meta, { get } from './utils/meta';

// validations
import disabled from './validations/disabled';
import focusable from './validations/focusable';
import focused from './validations/focused';
import scrollable, { scrollableX, scrollableY } from './validations/scrollable';

// actions
import click from './actions/click';
import focus from './actions/focus';
import blur from './actions/blur';
import scroll from './actions/scroll';

// properties
import scoped from './properties/scoped';

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

    // define meta properties for this instance
    defineProperty(this, meta, {
      enumerable: false,
      configurable: true,
      value: freeze(assign({
        scope,
        parent,
        detached
      }, get(this)))
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

  validate(predicates, format) {
    let validate;

    let assertion = function() {
      validate = validate || validator(this, true, format);
      return validate(predicates);
    };

    return this.when(assertion);
  }

  remains(predicates, timeout, format) {
    let validate;

    if (typeof timeout === 'string') {
      format = timeout;
      timeout = undefined;
    }

    let assertion = function() {
      validate = validate || validator(this, true, format);
      return validate(predicates);
    };

    return this.when(assertion)
      .always(assertion, timeout);
  }

  when(fn) {
    return super.when(function() {
      return fn.call(this, (fn.length > 0 ? this.$element : undefined));
    });
  }

  always(fn, timeout) {
    return super.always(function() {
      return fn.call(this, (fn.length > 0 ? this.$element : undefined));
    }, timeout);
  }

  do(fn) {
    return super.do(function() {
      return fn.call(this, (fn.length > 0 ? this.$element : undefined));
    });
  }
}

// define validation properties
defineProperties(
  Interactor.prototype,
  entries({
    disabled,
    focusable,
    focused,
    scrollableX,
    scrollableY,
    scrollable
  }).reduce((descriptors, [name, validation]) => {
    return assign(descriptors, {
      [name]: validation()
    });
  }, {})
);

// default actions
defineProperties(
  Interactor.prototype,
  entries({
    click,
    focus,
    blur,
    scroll,
    scoped
  }).reduce((descriptors, [name, method]) => {
    return assign(descriptors, {
      [name]: {
        value: wrap(method)
      }
    });
  }, {})
);

// define computed properties
// defineProperties(
//   Interactor.prototype,
//   entries({
//     text,
//     value,
//     isVisible,
//     isHidden,
//     isPresent
//   }).reduce((descriptors, [name, getter]) => {
//     return assign(descriptors, {
//       [name]: { get: getter }
//     });
//   }, {})
// );

export default Interactor;
