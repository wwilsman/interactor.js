import scoped from '../helpers/scoped';
import { dispatch } from './trigger';

export default function select(selector, option) {
  if (arguments.length === 1) {
    option = selector;
    selector = null;
  }

  let options = [].concat(option);

  return scoped(selector)
    .assert(function() {
      let element = this.$element;

      if (!('options' in element)) {
        throw new Error('not a select element');
      } else if (options.length > 1 && !element.multiple) {
        throw new Error('not a multi select');
      } else {
        let $options = [...element.options];

        for (let option of options) {
          let $opt = $options.find($opt => $opt.text === option);

          if (!$opt) {
            throw new Error(`unable to find "${option}"`);
          } else if ($opt.disabled) {
            throw new Error(`"${option}" is disabled`);
          }
        }
      }
    })
    .assert.f('Failed to select %s option: %e')
    .do(element => {
      for (let $option of element.options) {
        if (options.includes($option.text)) {
          $option.selected = element.multiple
            ? !$option.selected
            : true;

          dispatch(element, 'input', { cancelable: false });
          dispatch(element, 'change', { cancelable: false });
        }
      }
    });
}
