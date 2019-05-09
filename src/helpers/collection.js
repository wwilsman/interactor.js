import Interactor from '../interactor';
import meta from '../utils/meta';

const {
  getPrototypeOf
} = Object;

export default function collection(selector, properties) {
  let proto = properties && getPrototypeOf(properties);
  let ItemInteractor = Interactor;
  let scope = selector;

  if (proto === Interactor || proto instanceof Interactor) {
    ItemInteractor = properties;
  } else if (proto === Object.prototype) {
    ItemInteractor = Interactor.from(properties);
  }

  if (typeof selector === 'string') {
    scope = function(index) {
      if (typeof index === 'number') {
        let items = this.$$(selector);

        if (!items[index]) {
          throw new Error(`unable to find "${selector}" at index ${index}`);
        }

        return items[index];
      } else {
        return selector;
      }
    };
  }

  return {
    [meta]: {
      collection: true
    },
    value(...args) {
      if (args.length) {
        return new ItemInteractor({
          scope: () => scope.apply(this, args),
          parent: this,
          chain: true
        });
      } else {
        return this.$$(scope.call(this)).map(item => {
          return new ItemInteractor(item);
        });
      }
    }
  };
}
