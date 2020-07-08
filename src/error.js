import {
  create,
  defineProperties
} from './utils';

const regexDF = /%\{(.*?)\}/g; // regex directive format
const regexES = /\s{2,}/g; // regex extra-spaces

// Formats interactor error messages with specific directives.
function format(message, inst, expected) {
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
          return arg.split('|')[expected ? 0 : 1] || '';
        // remove unknown directives
        default:
          return '';
      }
    })
    // remove extraneous spaces
    .replace(regexES, ' ')
    .trim();
}

// Returns an interactor error. The provided message is parsed by the above format function.
export default function InteractorError(message) {
  if (!(this instanceof InteractorError)) {
    return new InteractorError(message);
  }

  Error.prototype.constructor.call(this, message);

  defineProperties(this, {
    raw: { value: message },

    // automatic formatting when a context is attached
    message: {
      configurable: true,
      get: () => (this.ctx && this.format().message) || this.raw
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
    value(ctx, expected) {
      return this.ctx ? this : (
        defineProperties(this, {
          ctx: { value: ctx },
          expected: { value: expected }
        })
      );
    }
  },

  // format the message with an interactor instance
  format: {
    value(message = '%{e}') {
      return defineProperties(this, {
        message: {
          value: format(
            message.replace('%{e}', this.raw),
            this.ctx,
            this.expected
          )
        }
      });
    }
  }
});
