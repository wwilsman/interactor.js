import {
  create,
  defineProperties,
  defineProperty
} from './utils';

const regexDF = /%\{(.*?)\}/g; // regex directive format
const regexES = /\s{2,}/g; // regex extra-spaces

// Formats interactor error messages with specific directives.
function format(message, inst, result) {
  return message
    // directive format: %{<directive> <arg>}
    .replace(regexDF, (_, f) => {
      let i = f.indexOf(' ');
      let directive = ~i ? f.substr(0, i) : f;
      let arg = ~i ? f.substr(i + 1) : '';

      if (arg === 'undefined' || arg === 'null') {
        arg = null;
      }

      switch (directive) {
        // %{@ <sel>} -> friendly interactor name with optional child selector
        case '@':
          return arg ? `${arg} within ${inst}` : inst.toString();
        // %{- <t>|<f>} -> use <t> when expecting a success, <f> otherwise
        case '-':
          return arg.split('|')[result ? 1 : 0] || '';
        // remove unknown directives
        default:
          return '';
      }
    })
    // remove extraneous spaces
    .replace(regexES, ' ')
    .trim();
}

// Returns an interactor error. The message may contain directives according to the format function
// above. If using a negative directive, the expectation should be provided as the second argument.
export default function InteractorError(message, result) {
  if (!(this instanceof InteractorError)) {
    return new InteractorError(message, result);
  }

  Error.prototype.constructor.call(this, message);

  defineProperties(this, {
    raw: { value: message },
    result: { value: result },

    // automatic formatting when a context is attached
    message: {
      configurable: true,
      get: () => (this.ctx && this.format()) || this.raw
    }
  });
}

defineProperties(InteractorError, {
  prototype: { value: create(Error.prototype) }
});

defineProperties(InteractorError.prototype, {
  // correct constructor
  constructor: { value: InteractorError },

  // correct name
  name: {
    get() {
      return this.constructor.name;
    }
  },

  // bind an interactor instance to this error when not already bound
  bind: {
    value(ctx) {
      return this.ctx ? this : (
        defineProperty(this, 'ctx', {
          configurable: true,
          value: ctx
        })
      );
    }
  },

  // format the message with an interactor instance
  format: {
    value() {
      return defineProperties(this, {
        message: {
          value: format(this.raw, this.ctx, this.result)
        }
      });
    }
  }
});
