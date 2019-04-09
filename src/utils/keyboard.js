import dispatch from './dispatch';
import keyDefinitions from './keydefs';
import { get } from './meta';

const { assign } = Object;
const K = Symbol('keyboard');

function getTopParent(instance) {
  while (get(instance, 'parent')) {
    instance = get(instance, 'parent');
  }

  return instance;
}

export function keyboard(instance, setters) {
  let top = getTopParent(instance);

  return (top[K] = assign({
    pressed: [],
    modifiers: {
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false
    }
  }, (
    top[K]
  ), (
    setters
  )));
}

export function getKeyDescr(key, modifiers) {
  let def = keyDefinitions[key];
  if (!def) throw new Error(`Unknown key: "${key}"`);

  let shift = modifiers.shiftKey;

  /* istanbul ignore next: most defs have keys, codes, and keycodes */
  let descr = {
    key: (shift && def.shiftKey) || def.key || '',
    keyCode: (shift && def.shiftKeyCode) || def.keyCode || 0,
    code: def.code || '',
    location: def.location || 0,
    text: (shift && def.shiftText) || def.text || ''
  };

  if (descr.key.length === 1) {
    descr.text = descr.key;
  }

  // if any modifiers besides shift are pressed, no text should be sent
  if (modifiers.altKey || modifiers.ctrlKey || modifiers.metaKey) {
    descr.text = '';
  }

  return descr;
}

const modifiersMap = {
  'Alt': 'altKey',
  'Control': 'ctrlKey',
  'Meta': 'metaKey',
  'Shift': 'shiftKey'
};

export function setModifier(key, value, modifiers) {
  let mod = modifiersMap[key];

  return mod
    ? assign({}, modifiers, { [mod]: value })
    : modifiers;
}

const inputReg = /^(input|textarea)$/i;

export function isInputElement(element) {
  return inputReg.test(element.tagName);
}

export function isBackOrDel(key) {
  return key === 'Backspace' || key === 'Delete';
}

// TODO: implement range and delete
export function inputText(element, text, options, range) {
  let opts = text ? assign({ charCode: text.charCodeAt(0) }, options) : options;
  let cancelled = !dispatch(element, 'keypress', opts);
  let isInput = isInputElement(element);

  // input events only happen on input elements
  if (!isInput && !element.isContentEditable) return;

  if (!cancelled) {
    cancelled = !dispatch(element, 'beforeinput', opts);
  }

  if (!cancelled) {
    let value = isInput ? element.value : element.textContent;
    range = range || value.length;

    if (typeof range === 'number') {
      range = [
        options.key === 'Backspace' ? range - 1 : range,
        options.key === 'Delete' ? range + 1 : range
      ];
    }

    value = value.slice(0, range[0]) + text + (
      value.slice(range[1] || range[0])
    );

    if (isInput) {
      element.value = value;
    } else {
      element.textContent = value;
    }

    dispatch(element, 'input', assign({
      cancelable: false
    }, opts));
  }
}
