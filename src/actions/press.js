import k from '../keyboard';
import { exec as keydown } from './keydown';
import { exec as keyup } from './keyup';

// Shared function to trigger keydown and keyup events on an element and possibly type resulting
// text into the element within an optional range.
export async function exec($element, parsed, { range, replace, delay }) {
  range = range != null && [].concat(range);

  // loop over each key
  for (let i = 0, l = parsed.length; i < l; i++) {
    // for the first key replace the range; otherwise insert after the previous key
    let ra = range && (i === 0 ? range : range[0] + i);
    // only replace the existing value for the first key
    let re = i === 0 && replace;

    // execute keydown and keyup actions
    keydown($element, parsed[i], { range: ra, replace: re });
    keyup($element, parsed[i]);

    // delay between presses if needed
    if (delay && i !== l - 1) {
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

// Interactor method to add a press action to the interactor's queue which will trigger keydown and
// keyup events for a specified key.
export default function press(keys, options = {}) {
  return this
    .assert.exists()
    .exec(async function($element) {
      let parsed = [].concat(keys).map(c => k.parse(this, c));
      await exec($element, parsed, options);
    });
}
