import { Interactor } from '../src';
import { $ as $find } from '../src/utils/dom';

// this file is always required in tests where the warning would be noisy in
// certain scenarios; suppress it by default and relevant tests can unset
Interactor.suppressLayoutEngineWarning = true;

export function $(selector, ctx) {
  return $find(selector, ctx || document);
}

export function injectHtml(html) {
  let $container = document.getElementById('test');

  if ($container) {
    document.body.removeChild($container);
  }

  $container = document.createElement('div');
  $container.innerHTML = html;
  $container.id = 'test';

  document.body.insertBefore($container, document.body.firstChild);
}

export function testDOMEvent(selector, event, callback = () => {}) {
  let test = {
    $element: $(selector),
    result: false,
    event: null
  };

  test.$element.addEventListener(event, e => {
    test.result = true;
    test.event = e;
    callback(e);
  });

  // test.reset = () => {
  //   test.result = false;
  // };

  return test;
}

function isJsdom() {
  let { result } = isJsdom;

  if (result == null) {
    result = navigator.userAgent.includes('jsdom');
    isJsdom.result = result;
  }

  return result;
}

export function toggleLayoutEngineWarning() {
  before(() => {
    // this is the default, was enabled for testing
    Interactor.suppressLayoutEngineWarning = null;
  });

  after(() => {
    // suppress for other tests
    Interactor.suppressLayoutEngineWarning = true;
  });
}

export function mockConsole(method) {
  let og = console[method];
  let logs = [];

  beforeEach(() => {
    console[method] = (...args) => logs.push(args);
    logs.length = 0;
  });

  afterEach(() => {
    console.log = og;
  });

  return logs;
}

describe.jsdom = (name, suite) => {
  if (isJsdom()) {
    return describe(`[jsdom only] ${name}`, suite);
  } else {
    return describe.skip(`[jsdom only] ${name}`);
  }
};

describe.skip.jsdom = (name, suite) => {
  if (isJsdom()) {
    return describe.skip(`[skipped in jsdom] ${name}`, suite);
  } else {
    return describe(name, suite);
  }
};

it.jsdom = (name, test) => {
  if (isJsdom()) {
    return it(`[jsdom only] ${name}`, test);
  } else {
    return it.skip(`[jsdom only] ${name}`);
  }
};

it.skip.jsdom = (name, test) => {
  if (isJsdom()) {
    return it.skip(`[skipped in jsdom] ${name}`, test);
  } else {
    return it(name, test);
  }
};
