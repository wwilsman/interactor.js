import Interactor from '../src/interactor';
import { $ as $find } from '../src/utils/dom';

// this file is always required in tests where the warning would be noisy in
// certain scenarios; suppress it by default and relevant tests can unset
Interactor.supressLayoutEngineWarning = true;

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

describe.jsdom = (name, suite) => {
  return describe(`[jsdom only] ${name}`, isJsdom() ? suite : undefined);
};

describe.skip.jsdom = (name, suite) => {
  if (isJsdom()) {
    return describe.skip(`[skipped in jsdom] ${name}`, suite);
  } else {
    return describe(name, suite);
  }
};

it.jsdom = (name, test) => {
  return it(`[jsdom only] ${name}`, isJsdom() ? test : undefined);
};

it.skip.jsdom = (name, test) => {
  if (isJsdom()) {
    return it.skip(`[skipped in jsdom] ${name}`, test);
  } else {
    return it(name, test);
  }
};
