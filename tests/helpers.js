import { $ } from '../src/utils/dom';
export { $ } from '../src/utils/dom';

/**
 * Inserts HTML into a testing DOM element
 *
 * @param {String} html - HTML string to inject
 */
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

/**
 * Creates a reusable test object that is updated when the specified
 * event is triggered and reset when the reset method is invoked.
 *
 * @param {String} selector - Element selector
 * @param {String} event - Event name
 * @param {Function} [callback] - Event callback
 */
export function testDOMEvent(selector, event, callback = () => {}) {
  let test = { result: false };

  $(selector).addEventListener(event, e => {
    test.result = true;
    e.preventDefault();
    callback(e);
  });

  test.reset = () => {
    test.result = false;
  };

  return test;
}
