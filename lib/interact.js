import Assertion from './assertion.js';
import Context from './context.js';
import Interaction from './interaction.js';

import { Chain, flattenChain } from './chainable.js';
import { retry } from './retry.js';

async function iterate(iter, callback, signal) {
  let done, value, error;

  while (!done) {
    try {
      value = await callback(value);
    } catch (e) {
      error = e;
    }

    ({ done, value } = (error ?? signal?.aborted)
      ? await iter.throw(error ?? signal.reason)
      : await iter.next(value));
  }

  return callback(value);
}

export function interact(context, subject, signal) {
  context = new Context(context[Context.Symbol] ?? context);

  let handle = async value => {
    if (value?.then?.[Chain]) {
      return flattenChain(value.then).slice(0, -1)
        .reduce((promise, next) => {
          return promise.then(() => handle(next));
        }, Promise.resolve());
    }

    while (value && (
      typeof value[Interaction.Symbol] === 'function' ||
      typeof value[Assertion.Symbol] === 'function' ||
      typeof value.next === 'function' ||
      typeof value.then === 'function' ||
      typeof value === 'function'
    )) {
      if (typeof value[Interaction.Symbol] === 'function' || (
        typeof value[Assertion.Symbol] === 'function' && context.assert.expected != null))
        value = interact(context, value, signal);
      else if (typeof value[Assertion.Symbol] === 'function')
        value = retry(interact, context, value, signal);
      else if (typeof value === 'function')
        value = value.call(context.i, context);
      else if (typeof value.next === 'function')
        value = iterate(value, handle, signal);
      else value = await value;
    }

    return value;
  };

  if (subject[Context.Symbol])
    context.set(subject[Context.Symbol]);
  if (subject[Interaction.Symbol])
    return handle(subject[Interaction.Symbol]);
  if (subject[Assertion.Symbol])
    return handle(subject[Assertion.Symbol]);

  return [].concat(subject).reduce((promise, value) => {
    return promise.then(() => handle(value));
  }, Promise.resolve());
}

export default interact;
