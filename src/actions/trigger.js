import { dispatch } from '../dom';

export default function trigger(event, options = {}) {
  return this.exec($el => dispatch($el, event, options));
}
