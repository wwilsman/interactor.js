import { $ } from '../src/utils/dom';
export { $ } from '../src/utils/dom';

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
