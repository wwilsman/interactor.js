import scoped from '../helpers/scoped';

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
            throw new Error(`"${option}" is not an available option`);
          } else if ($opt.disabled) {
            throw new Error(`"${option}" is disabled`);
          }
        }
      }
    })
    .do(element => {
      for (let $option of element.options) {
        if (options.includes($option.text)) {
          $option.selected = element.multiple
            ? !$option.selected
            : true;
        }
      }

      element.dispatchEvent(
        new Event('input', {
          bubbles: true,
          cancelable: true
        })
      );

      element.dispatchEvent(
        new Event('change', {
          bubbles: true,
          cancelable: true
        })
      );
    });
}
