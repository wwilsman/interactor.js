import m from './meta';
import { dispatch } from './dom';
import getKeyDefinition from './keydefs';

import {
  assign,
  defineProperty,
  defineProperties,
  getOwnPropertyDescriptor
} from './utils';

// Keyboard class used to track pressed keys and modifiers for an interactor instance.
export default function Keyboard(options) {
  if (!(this instanceof Keyboard)) {
    return new Keyboard(options);
  }

  // assign pressed keys and modifiers
  assign(this, {
    pressed: [].concat(
      options?.pressed || []
    ),

    modifiers: assign({
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false
    }, options?.modifiers)
  });
}

// Static methods
defineProperties(Keyboard, {
  // Parse the event key with the topmost interactor's keyboard instance.
  parse: {
    value: function parse(inst, event, key) {
      let top = inst;

      while (m.get(top, 'parent')) {
        top = m.get(top, 'parent');
      }

      return m.get(top, 'keyboard')
        .parse(event, key);
    }
  },

  // Assign a keyboard instance to an interactor.
  assign: {
    value: function assign(inst, interactor) {
      return m.new(interactor, 'keyboard', inst);
    }
  }
});

// Instance methods
defineProperties(Keyboard.prototype, {
  // Retrieve a key definition and return it with a new keyboard instance when pressed keys or
  // modifiers change during keydown and keyup events.
  parse: {
    value: function parse(event, key) {
      let { pressed, modifiers } = this;
      let d = getKeyDefinition(key, modifiers);
      let k = this;

      if (event === 'keydown') {
        d.event.repeat = pressed.includes(d.event.code);

        k = new this.constructor({
          pressed: d.event.repeat ? pressed : pressed.concat(d.event.code),
          modifiers: this.modifier(d.event.key, true)
        });
      } else if (event === 'keyup') {
        k = new this.constructor({
          pressed: pressed.filter(c => c !== d.event.code),
          modifiers: this.modifier(d.event.key, false)
        });
      }

      return [k, d];
    }
  },

  // Return a new modifiers object with the specified key activated or not. When the key is not a
  // modifier, the existing modifiers object is returned unmodified.
  modifier: {
    value: function modifier(key, active) {
      let mod = ({
        Alt: 'altKey',
        Control: 'ctrlKey',
        Meta: 'metaKey',
        Shift: 'shiftKey'
      })[key];

      return mod
        ? assign({}, this.modifiers, { [mod]: active })
        : this.modifiers;
    }
  },

  // Insert a character into an element at the specified range. The second argument should be the
  // result of parsing a key with the instance parse method.
  input: {
    value: function input($el, { text: char, event }, range) {
      let isInput = (/^(input|textarea)$/i).test($el.tagName);

      // input events only happen on input elements
      if (!isInput && !$el.isContentEditable) return;

      // sometimes, the `value` property of input elements is modified by frameworks and will not
      // reflect changes to this property; to work around this, we cache any custom value property
      // descriptor and reapply it later
      let descr = isInput && getOwnPropertyDescriptor($el, 'value');
      if (descr) delete $el.value;

      // add the charCode to the event options
      event = char ? assign({
        charCode: char.charCodeAt(0)
      }, event) : event;

      // check if any event is cancelled
      let cancelled = !(
        dispatch($el, 'keypress', event) &&
          dispatch($el, 'beforeinput', event)
      );

      if (!cancelled) {
        let value = isInput ? $el.value : $el.textContent;
        range = range || value.length;

        // adjust the range if backspace or delete was pressed
        if (typeof range === 'number') {
          range = [
            event.key === 'Backspace' ? range - 1 : range,
            event.key === 'Delete' ? range + 1 : range
          ];
        }

        // erase text encapsulated by the range
        value = value.slice(0, range[0]) + char + (
          value.slice(range[1] || range[0])
        );

        if (isInput) {
          $el.value = value;
        } else {
          $el.textContent = value;
        }

        dispatch($el, 'input', assign({ cancelable: false }, event));
      }

      // restore artificial value property descriptor
      if (descr) defineProperty($el, 'value', descr);
    }
  }
});
