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

export function skipForJsdom(callback) {
  let { result } = skipForJsdom;

  if (result == null) {
    result = navigator.userAgent.includes('jsdom');
    skipForJsdom.result = result;
  }

  return result ? function() {
    if (!this.skip) {
      before(function() { this.skip(); });
      callback.call(this);
    } else {
      this.skip();
    }
  } : callback;
}
