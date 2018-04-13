(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.BigTest = global.BigTest || {}, global.BigTest.Interaction = {})));
}(this, (function (exports) { 'use strict';

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

function convergeOn(assertion) {
  var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2000;
  var always = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var start = Date.now();
  var interval = 10;
  var stats = {
    start: start,
    runs: 0,
    end: start,
    elapsed: 0,
    always: always,
    timeout: timeout,
    value: undefined
  };
  return new Promise(function (resolve, reject) {
    (function loop() {
      stats.runs += 1;

      try {
        var results = assertion();
        var doLoop = Date.now() - start < timeout;

        if (always && doLoop) {
          setTimeout(loop, interval);
        } else if (results === false) {
          throw new Error('convergent assertion returned `false`');
        } else if (!always && !doLoop) {
          throw new Error('convergent assertion was successful, ' + "but exceeded the ".concat(timeout, "ms timeout"));
        } else {
          stats.end = Date.now();
          stats.elapsed = stats.end - start;
          stats.value = results;
          resolve(stats);
        }
      } catch (error) {
        var _doLoop = Date.now() - start < timeout;

        if (!always && _doLoop) {
          setTimeout(loop, interval);
        } else if (always || !_doLoop) {
          reject(error);
        }
      }
    })();
  });
}

function getElapsedSince(start, max) {
  var elapsed = Date.now() - start;

  if (elapsed >= max) {
    throw new Error("convergence exceeded the ".concat(max, "ms timeout"));
  }

  return elapsed;
}



function collectStats(accumulator, stats) {
  accumulator.runs += stats.runs;
  accumulator.elapsed += stats.elapsed;
  accumulator.end = stats.end;
  accumulator.value = stats.value;
  accumulator.stack.push(stats);
  return stats.value;
}

function isConvergence(obj) {
  return !!obj && _typeof(obj) === 'object' && '_stack' in obj && Array.isArray(obj._stack) && 'timeout' in obj && typeof obj.timeout === 'function' && 'run' in obj && typeof obj.run === 'function';
}
function runAssertion(subject, arg, stats) {
  var timeout = stats.timeout - getElapsedSince(stats.start, stats.timeout);
  var assertion = subject.assertion.bind(this, arg);

  if (subject.always && !subject.last) {
    if (subject.timeout) {
      timeout = Math.min(timeout, subject.timeout);
    } else {
      timeout = Math.max(stats.timeout / 10, 20);
    }
  }

  return convergeOn(assertion, timeout, subject.always).then(function (convergeStats) {
    return collectStats(stats, convergeStats);
  });
}
function runCallback(subject, arg, stats) {
  var start = Date.now();
  var result = subject.callback.call(this, arg);

  var collectExecStats = function collectExecStats(value) {
    return collectStats(stats, {
      start: start,
      runs: 1,
      end: Date.now(),
      elapsed: getElapsedSince(start, stats.timeout),
      value: value
    });
  };

  if (isConvergence(result)) {
    var timeout = stats.timeout - getElapsedSince(start, stats.timeout);

    if (!subject.last) {
      result = result.do(function (ret) {
        return ret;
      });
    }

    return result.timeout(timeout).run().then(function (convergeStats) {
      return collectStats(stats, convergeStats);
    });
  } else if (result && typeof result.then === 'function') {
    return result.then(collectExecStats);
  } else {
    return collectExecStats(result);
  }
}

var Convergence = function () {
  function Convergence() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var previous = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Convergence);

    if (typeof options === 'number') {
      options = {
        _timeout: options
      };
    }

    var _options = options,
        _options$_timeout = _options._timeout,
        _timeout = _options$_timeout === void 0 ? previous._timeout || 2000 : _options$_timeout,
        _options$_stack = _options._stack,
        _stack = _options$_stack === void 0 ? [] : _options$_stack;

    _stack = _toConsumableArray(previous._stack || []).concat(_toConsumableArray(_stack));
    Object.defineProperties(this, {
      _timeout: {
        value: _timeout
      },
      _stack: {
        value: _stack
      }
    });
  }

  _createClass(Convergence, [{
    key: "timeout",
    value: function timeout(_timeout2) {
      if (typeof _timeout2 !== 'undefined') {
        return new this.constructor(_timeout2, this);
      } else {
        return this._timeout;
      }
    }
  }, {
    key: "when",
    value: function when(assertion) {
      return new this.constructor({
        _stack: [{
          assertion: assertion
        }]
      }, this);
    }
  }, {
    key: "once",
    value: function once() {
      console.warn('#once() has been deprecated in favor of #when()');
      return this.when.apply(this, arguments);
    }
  }, {
    key: "always",
    value: function always(assertion, timeout) {
      return new this.constructor({
        _stack: [{
          always: true,
          assertion: assertion,
          timeout: timeout
        }]
      }, this);
    }
  }, {
    key: "do",
    value: function _do(callback) {
      return new this.constructor({
        _stack: [{
          callback: callback
        }]
      }, this);
    }
  }, {
    key: "append",
    value: function append(convergence) {
      if (!isConvergence(convergence)) {
        throw new Error('.append() only works with convergence instances');
      }

      return new this.constructor({
        _stack: convergence._stack
      }, this);
    }
  }, {
    key: "run",
    value: function run() {
      var _this = this;

      var start = Date.now();
      var stats = {
        start: start,
        runs: 0,
        end: start,
        elapsed: 0,
        value: undefined,
        timeout: this._timeout,
        stack: []
      };
      return this._stack.reduce(function (promise, subject, i) {
        if (i === _this._stack.length - 1) {
          subject = Object.assign({
            last: true
          }, subject);
        }

        return promise.then(function (ret) {
          if (subject.assertion) {
            return runAssertion.call(_this, subject, ret, stats);
          } else if (subject.callback) {
            return runCallback.call(_this, subject, ret, stats);
          }
        });
      }, Promise.resolve()).then(function () {
        return stats;
      });
    }
  }, {
    key: "then",
    value: function then() {
      var promise = this.run().then(function (_ref) {
        var value = _ref.value;
        return value;
      });
      return promise.then.apply(promise, arguments);
    }
  }]);

  return Convergence;
}();

Convergence.isConvergence = isConvergence;

function $(selector) {
  var $ctx = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
  var $node = selector;

  if (!$ctx || typeof $ctx.querySelector !== 'function') {
    throw new Error('unable to use the current context');
  }

  if (typeof selector === 'string') {
    $node = $ctx.querySelector(selector);
  } else if (!selector) {
    return $ctx;
  }

  if (!$node) {
    throw new Error("unable to find \"".concat(selector, "\""));
  }

  return $node;
}
function $$(selector) {
  var $ctx = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
  var nodes = [];

  if (!$ctx || typeof $ctx.querySelectorAll !== 'function') {
    throw new Error('unable to use the current context');
  }

  if (typeof selector === 'string') {
    nodes = [].slice.call($ctx.querySelectorAll(selector));
  }

  return nodes;
}
function isInteractor(obj) {
  return isConvergence(obj) && '$' in obj && typeof obj.$ === 'function' && '$$' in obj && typeof obj.$$ === 'function' && '$root' in obj;
}
function isPropertyDescriptor(descr) {
  return descr && (Object.hasOwnProperty.call(descr, 'get') || Object.hasOwnProperty.call(descr, 'value')) && Object.hasOwnProperty.call(descr, 'enumerable') && Object.hasOwnProperty.call(descr, 'configurable');
}

function computed(getter) {
  return Object.assign({
    enumerable: false,
    configurable: false,
    get: getter
  });
}
function action(method) {
  return Object.assign({
    enumerable: false,
    configurable: false,
    value: method
  });
}

function find(selector) {
  var _this = this;

  return this.when(function () {
    return _this.$(selector);
  });
}
function find$1 (selector) {
  return computed(function () {
    return this.$(selector);
  });
}

function findAll(selector) {
  var _this = this;

  return this.when(function () {
    return _this.$$(selector);
  });
}
function findAll$1 (selector) {
  return computed(function () {
    return this.$$(selector);
  });
}

function click(selector) {
  return this.find(selector).do(function ($node) {
    return $node.click();
  });
}
function clickable (selector) {
  return action(function () {
    return this.click(selector);
  });
}

function fill(selectorOrValue, value) {
  var selector;

  if (typeof value === 'undefined') {
    value = selectorOrValue;
  } else {
    selector = selectorOrValue;
  }

  return this.find(selector).do(function ($node) {
    var descriptor = Object.getOwnPropertyDescriptor($node, 'value');
    if (descriptor) delete $node.value;
    $node.value = value;
    $node.dispatchEvent(new Event('input', {
      bubbles: true,
      cancelable: true
    }));
    $node.dispatchEvent(new Event('change', {
      bubbles: true,
      cancelable: true
    }));

    if (descriptor) {
      Object.defineProperty($node, 'value', descriptor);
    }
  });
}
function fillable (selector) {
  return action(function (value) {
    return this.fill(selector, value);
  });
}

function focus(selector) {
  return this.find(selector).do(function ($node) {
    $node.dispatchEvent(new Event('focus', {
      bubbles: true,
      cancelable: true
    }));
  });
}
function focusable (selector) {
  return action(function () {
    return this.focus(selector);
  });
}

function blur(selector) {
  return this.find(selector).do(function ($node) {
    $node.dispatchEvent(new Event('blur', {
      bubbles: true,
      cancelable: true
    }));
  });
}
function blurrable (selector) {
  return action(function () {
    return this.blur(selector);
  });
}

function getTriggerArgs(args) {
  var selector, eventName, options;

  if (args.length === 3) {
    var _args = _slicedToArray(args, 3);

    selector = _args[0];
    eventName = _args[1];
    options = _args[2];
  } else if (args.length === 2) {
    if (typeof args[1] === 'string') {
      var _args2 = _slicedToArray(args, 2);

      selector = _args2[0];
      eventName = _args2[1];
    } else {
      var _args3 = _slicedToArray(args, 2);

      eventName = _args3[0];
      options = _args3[1];
    }
  } else {
    var _args4 = _slicedToArray(args, 1);

    eventName = _args4[0];
  }

  return [selector, eventName, options];
}

function trigger() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var _getTriggerArgs = getTriggerArgs(args),
      _getTriggerArgs2 = _slicedToArray(_getTriggerArgs, 3),
      selector = _getTriggerArgs2[0],
      eventName = _getTriggerArgs2[1],
      _getTriggerArgs2$ = _getTriggerArgs2[2],
      options = _getTriggerArgs2$ === void 0 ? {} : _getTriggerArgs2$;

  return this.find(selector).do(function ($node) {
    var bubbles = 'bubbles' in options ? options.bubbles : true;
    var cancelable = 'cancelable' in options ? options.cancelable : true;
    delete options.bubbles;
    delete options.cancelable;
    var event = new Event(eventName, {
      bubbles: bubbles,
      cancelable: cancelable
    });
    Object.assign(event, options);
    $node.dispatchEvent(event);
  });
}
function triggerable () {
  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  var _getTriggerArgs3 = getTriggerArgs(args),
      _getTriggerArgs4 = _slicedToArray(_getTriggerArgs3, 3),
      selector = _getTriggerArgs4[0],
      eventName = _getTriggerArgs4[1],
      _getTriggerArgs4$ = _getTriggerArgs4[2],
      options = _getTriggerArgs4$ === void 0 ? {} : _getTriggerArgs4$;

  return action(function (opts) {
    opts = Object.assign({}, options, opts);
    return this.trigger(selector, eventName, opts);
  });
}

function scroll(selectorOrScrollTo, scrollTo) {
  var selector;

  if (typeof scrollTo === 'undefined') {
    scrollTo = selectorOrScrollTo;
  } else {
    selector = selectorOrScrollTo;
  }

  return this.find(selector).do(function ($node) {
    if (typeof scrollTo.left === 'number') {
      $node.scrollLeft = scrollTo.left;
    }

    if (typeof scrollTo.top === 'number') {
      $node.scrollTop = scrollTo.top;
    }

    $node.dispatchEvent(new Event('scroll', {
      bubbles: true,
      cancelable: true
    }));
  });
}
function scrollable (selector) {
  return action(function (scrollTo) {
    return this.scroll(selector, scrollTo);
  });
}

function getText($el) {
  return $el.textContent.replace(/[\n\r]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

function text() {
  return getText(this.$root);
}
function text$1 (selector) {
  return computed(function () {
    return getText(this.$(selector));
  });
}

function value() {
  return this.$root.value;
}
function value$1 (selector) {
  return computed(function () {
    return this.$(selector).value;
  });
}

function isVisible() {
  return !!this.$root.getClientRects().length;
}
function isVisible$1 (selector) {
  return computed(function () {
    return !!this.$(selector).getClientRects().length;
  });
}

function isHidden() {
  return !this.$root.getClientRects().length;
}
function isHidden$1 (selector) {
  return computed(function () {
    return !this.$(selector).getClientRects().length;
  });
}

function isPresent() {
  try {
    return !!this.$root;
  } catch (e) {
    return false;
  }
}
function isPresent$1 (selector) {
  return computed(function () {
    return this.isPresent && !!this.$$(selector).length;
  });
}

function interactor(Class) {
  var CustomInteractor = function (_Interactor) {
    _inherits(CustomInteractor, _Interactor);

    function CustomInteractor() {
      _classCallCheck(this, CustomInteractor);

      return _possibleConstructorReturn(this, (CustomInteractor.__proto__ || Object.getPrototypeOf(CustomInteractor)).apply(this, arguments));
    }

    return CustomInteractor;
  }(Interactor);

  var proto = Object.getOwnPropertyDescriptors(Class.prototype);

  var _arr = Object.entries(new Class());

  var _loop = function _loop() {
    var _arr$_i = _slicedToArray(_arr[_i], 2),
        key = _arr$_i[0],
        value = _arr$_i[1];

    if (isPropertyDescriptor(value)) {
      proto[key] = value;
    } else if (isInteractor(value)) {
      proto[key] = {
        get: function get() {
          return new value.constructor({
            parent: this
          }, value);
        }
      };
    } else {
      proto[key] = {
        value: value
      };
    }
  };

  for (var _i = 0; _i < _arr.length; _i++) {
    _loop();
  }

  delete proto.constructor;

  var _arr2 = Object.keys(proto);

  for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
    var key = _arr2[_i2];

    if (key in Interactor.prototype) {
      throw new Error("cannot redefine existing property \"".concat(key, "\""));
    }
  }

  Object.defineProperties(CustomInteractor.prototype, proto);
  Object.defineProperty(CustomInteractor, 'name', {
    value: Class.name
  });

  if (Class.defaultScope) {
    Object.defineProperty(CustomInteractor, 'defaultScope', {
      value: Class.defaultScope
    });
  }

  return CustomInteractor;
}

function collection (selector) {
  var descriptors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var ItemInteractor;

  if (descriptors.prototype instanceof Interactor) {
    ItemInteractor = descriptors;
  } else {
    ItemInteractor = interactor(function () {
      Object.assign(this, descriptors);
    });
  }

  return function (index) {
    var _this = this;

    if (typeof index === 'undefined') {
      return this.$$(selector).map(function (item) {
        return new ItemInteractor(item);
      });
    } else {
      return new ItemInteractor({
        parent: this,
        scope: function scope() {
          var items = _this.$$(selector);

          if (!items[index]) {
            throw new Error("unable to find \"".concat(selector, "\" at index ").concat(index));
          }

          return items[index];
        }
      });
    }
  };
}

function count (selector) {
  return computed(function () {
    return this.$$(selector).length;
  });
}

function attribute (selector, attr) {
  if (!attr) {
    attr = selector;
    selector = null;
  }

  return computed(function () {
    return this.$(selector).getAttribute(attr);
  });
}

function property (selector, prop) {
  if (!prop) {
    prop = selector;
    selector = null;
  }

  return computed(function () {
    return this.$(selector)[prop];
  });
}

function hasClass (selector, className) {
  if (!className) {
    className = selector;
    selector = null;
  }

  return computed(function () {
    return this.$(selector).classList.contains(className);
  });
}

function elementMatches($el, selector) {
  if (!$el.matches) {
    return $el.msMatchesSelector(selector);
  } else {
    return $el.matches(selector);
  }
}

function is (selector, match) {
  return computed(function () {
    return elementMatches(this.$(selector), match);
  });
}

var methods = {
  find: find,
  findAll: findAll,
  click: click,
  fill: fill,
  focus: focus,
  blur: blur,
  trigger: trigger,
  scroll: scroll
};
var properties = {
  text: text,
  value: value,
  isVisible: isVisible,
  isHidden: isHidden,
  isPresent: isPresent
};

var Interactor = function (_Convergence) {
  _inherits(Interactor, _Convergence);

  function Interactor() {
    var _this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var previous = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Interactor);

    _this = _possibleConstructorReturn(this, (Interactor.__proto__ || Object.getPrototypeOf(Interactor)).call(this, options, previous));

    if (previous.parent) {
      return _possibleConstructorReturn(_this, previous.parent.append(_assertThisInitialized(_this)));
    }

    if (typeof options === 'string' || options instanceof Element || typeof options === 'function') {
      options = {
        scope: options
      };
    }

    var _options = options,
        _options$parent = _options.parent,
        parent = _options$parent === void 0 ? null : _options$parent,
        _options$scope = _options.scope,
        scope = _options$scope === void 0 ? _this.constructor.defaultScope : _options$scope;

    while (parent && parent.parent) {
      parent = parent.parent;
    }

    Object.defineProperties(_assertThisInitialized(_this), {
      parent: {
        value: parent
      },
      $root: Object.getOwnPropertyDescriptor(previous, '$root') || {
        get: function get() {
          return $(typeof scope === 'function' ? scope() : scope);
        }
      }
    });
    return _this;
  }

  _createClass(Interactor, [{
    key: "$",
    value: function $$$1(selector) {
      return $(selector, this.$root);
    }
  }, {
    key: "$$",
    value: function $$$$1(selector) {
      return $$(selector, this.$root);
    }
  }, {
    key: "pause",
    value: function pause() {
      return this.do(function () {
        return new Promise(function () {});
      });
    }
  }]);

  return Interactor;
}(Convergence);

Object.defineProperties(Interactor, {
  isInteractor: {
    value: isInteractor
  },
  defaultScope: {
    value: document.body
  }
});
Object.defineProperties(Interactor.prototype, Object.entries(methods).reduce(function (descriptors, _ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      name = _ref2[0],
      method = _ref2[1];

  return Object.assign(descriptors, _defineProperty({}, name, {
    value: method
  }));
}, {}));
Object.defineProperties(Interactor.prototype, Object.entries(properties).reduce(function (descriptors, _ref3) {
  var _ref4 = _slicedToArray(_ref3, 2),
      name = _ref4[0],
      getter = _ref4[1];

  return Object.assign(descriptors, _defineProperty({}, name, {
    get: getter
  }));
}, {}));

exports.Interactor = Interactor;
exports.interactor = interactor;
exports.methods = methods;
exports.properties = properties;
exports.clickable = clickable;
exports.fillable = fillable;
exports.focusable = focusable;
exports.blurrable = blurrable;
exports.triggerable = triggerable;
exports.scrollable = scrollable;
exports.collection = collection;
exports.find = find$1;
exports.findAll = findAll$1;
exports.count = count;
exports.text = text$1;
exports.value = value$1;
exports.attribute = attribute;
exports.property = property;
exports.hasClass = hasClass;
exports.is = is;
exports.isVisible = isVisible$1;
exports.isHidden = isHidden$1;
exports.isPresent = isPresent$1;
exports.computed = computed;
exports.action = action;

Object.defineProperty(exports, '__esModule', { value: true });

})));
