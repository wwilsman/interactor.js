/**
 * @param {string} eventName
 * @param {{
 *   bubbles?: boolean,
 *   cancelable?: boolean,
 *   [key: string]: any
 * }} [options]
 * @returns Generator<any, any, any>
 */
export function* trigger(eventName, {
  bubbles = true,
  cancelable = true,
  ...eventProperties
} = {}) {
  return yield ({ $ }) => $.dispatchEvent(Object.assign(
    new Event(eventName, { bubbles, cancelable }),
    eventProperties
  ));
}

export default trigger;
