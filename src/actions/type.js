import scoped from '../helpers/scoped';
import { dispatch } from './trigger';

const { assign } = Object;
const stringReg = /{.+?}|(.)\1*/g;
const inputReg = /^(input|textarea)$/i;

const keyAliases = {
  opt: 'Alt',
  option: 'Alt',
  ctrl: 'Control',
  ctl: 'Control',
  windows: 'Meta',
  win: 'Meta',
  command: 'Meta',
  cmd: 'Meta',
  return: 'Enter',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  up: 'ArrowUp',
  pagedown: 'PageDown',
  pageup: 'PageUp',
  del: 'Delete',
  ins: 'Insert',
  esc: 'Escape'
};

const modifierMap = {
  Alt: 'altKey',
  Control: 'ctrlKey',
  Meta: 'metaKey',
  Shift: 'shiftKey'
};

function titlecase(str) {
  return str[0].toUpperCase() + str.substr(1);
}

function wait(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

function parse(c) {
  let key, modifier;
  let repeat = 1;

  if (c[0] === '{' && c[c.length - 1] === '}') {
    let [k, r = 1] = c.substr(1, c.length - 2).split(':');
    key = keyAliases[k] || titlecase(k);
    modifier = modifierMap[key];
    repeat = parseInt(r, 10);
  } else if (c.length > 1) {
    key = c[0];
    repeat = c.length;
  } else {
    key = c;
  }

  let char = key.length === 1 ? key : '';
  key = char === ' ' ? 'Space' : key;

  return { key, char, repeat, modifier };
}

export default function type(selector, string, options = {}) {
  if (typeof string === 'object' || !string) {
    options = string || options;
    string = selector;
    selector = null;
  }

  return scoped(selector)
    .assert(element => {
      if (inputReg.test(element.tagName)) {
        if (element.disabled) throw new Error('disabled');
      } else if (!element.isContentEditable) {
        throw new Error('not an input, textarea, or content editable element');
      }
    })
    .assert.f('Failed to type in %s: %e')
    .do(async element => {
      let event = {
        altKey: !!options.altKey,
        ctrlKey: !!options.ctrlKey,
        metaKey: !!options.metaKey,
        shiftKey: !!options.shiftKey
      };

      let keys = string.match(stringReg).map(parse);
      let isInput = inputReg.test(element.tagName);

      for (let match of keys) {
        let { key, char, repeat, modifier } = match;
        let e = assign({ key }, event);
        let cancelled = false;

        for (let j = 0; j < repeat; j++) {
          if (modifier) {
            event[modifier] = e[modifier] = !e[modifier];
          }

          if (!modifier || e[modifier]) {
            cancelled = !dispatch(element, 'keydown', e);
          }

          if (char) {
            let charEvent = assign({
              charCode: char.charCodeAt(0)
            }, e);

            if (!cancelled) {
              cancelled = !dispatch(element, 'keypress', charEvent);
            }

            if (!cancelled && options.beforeinput) {
              cancelled = !dispatch(element, 'beforeinput', charEvent);
            }

            if (!cancelled) {
              if (isInput) {
                element.value += char;
              } else {
                element.textContent += char;
              }

              dispatch(element, 'input', assign({
                cancelable: false
              }, charEvent));
            }
          }

          if (key === 'Backspace') {
            if (isInput) {
              let val = element.value;
              element.value = val.substr(0, val.length - 1);
            } else {
              let val = element.textContent;
              element.textContent = val.substr(0, val.length - 1);
            }
          }

          if (!modifier || !e[modifier]) {
            dispatch(element, 'keyup', assign({
              cancelable: false
            }, e));
          }

          if (options.delay && match !== keys[keys.length - 1]) {
            await wait(options.delay);
          }
        }
      }

      if (isInput && options.change) {
        dispatch(element, 'change', { cancelable: false });
      }
    });
}
