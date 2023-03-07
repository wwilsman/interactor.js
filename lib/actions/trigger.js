import { dispatch } from '../dom.js';

export default function trigger(event, options = {}) {
  return this
    .assert.exists()
    .exec($el => dispatch($el, event, options));
}
