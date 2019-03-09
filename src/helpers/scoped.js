import Interactor from '../interactor';

const {
  getPrototypeOf
} = Object;

export default function scoped(selector, properties) {
  let proto = properties && getPrototypeOf(properties);
  let ScopedInteractor = Interactor;

  if (proto === Interactor || proto instanceof Interactor) {
    ScopedInteractor = properties;
  } else if (proto === Object.prototype) {
    ScopedInteractor = Interactor.from(properties);
  }

  return new ScopedInteractor({
    scope: selector,
    detached: false
  });
}
