import error from '../error';
import { dispatch } from '../dom';

function options($el, selector, each) {
  let multi = Array.isArray(selector);

  if (!('options' in $el)) {
    throw error('%{@} is not a select element');
  } else if (multi && !$el.multiple) {
    throw error('%{@} is not a multi select element');
  }

  if ($el.multiple) {
    if (multi) {
      selector.map(s => each(this.$(s), s));
    } else {
      this.$$(selector).map($o => each($o, selector));
    }
  } else {
    each(this.$(selector), selector);
  }
}

export default function select(selector) {
  return this
    .assert.not.disabled()
    .assert(function($el) {
      options.call(this, $el, selector, ($opt, sel) => {
        if ($opt.disabled) {
          throw error(`%{@ ${sel}} is disabled`);
        }
      });
    })
    .exec(function($el) {
      options.call(this, $el, selector, $opt => {
        $opt.selected = $el.multiple ? !$opt.selected : true;
        dispatch($el, 'input', { cancelable: false });
        dispatch($el, 'change', { cancelable: false });
      });
    });
}
