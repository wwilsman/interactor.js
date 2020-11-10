import {
  create,
  defineProperties
} from './utils';

export default function InteractorError(message) {
  if (!(this instanceof InteractorError)) {
    return new InteractorError(message);
  }

  Error.prototype.constructor.call(this, message);
  Error.captureStackTrace?.(this, InteractorError);

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

// regex for the Directive Format
const regexDF = /%\{((?:%\{.*?}|.)*?)}/gs;
// regex Non-String values
const regexNS = /^(true|false|undefined|null|[\d.,]+|\[.*\]|\{.*})$/;
// regex for Extra-Spaces
const regexES = /\s{2,}/g;

// Formats interactor error messages with specific directives.
function format(message, inst, expected) {
  return message
    // directive format: %{<directive> <arg>}
    .replace(regexDF, (_, f) => {
      let arg = f.substr(1).trim();

      // recersively format any nested directives
      if (regexDF.test(arg)) {
        arg = format(arg, inst, expected);
      }

      switch (f[0]) {
        // %{@ <sel>} -> friendly interactor name with optional child selector
        case '@':
          return arg ? `${arg} within ${inst}` : inst.toString();
        // %{- <t>|<f>} -> use <t> when expecting a success, <f> otherwise
        case '-':
          return arg.split('|')[expected ? 0 : 1] || '';
        // %{" <val>} -> quote values that look like strings
        case '"':
          return !regexNS.test(arg) ? `"${arg}"` : arg;
        // remove unknown directives
        default:
          return '';
      }
    })
    // remove extraneous spaces
    .replace(regexES, ' ')
    .trim();
}
