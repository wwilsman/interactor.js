import { dispatch } from '../dom';

export default function trigger(event, options = {}) {
  return this
    .assert.exists()
    .exec($el => dispatch($el, event, options));
}
