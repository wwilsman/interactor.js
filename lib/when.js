import { assign, now } from './utils.js';

// Repeatedly runs the assertion every interval until it does not throw an error or until the
// timeout is reached. Once passing, if `remains` is provided, the assertion will continue to run
// every interval throughout the `remains` period unless it throws an error again. This function
// returns a thennable function that runs the assertion when called or awaited on.
export default function when(assertion, options = {}) {
  if (Number.isInteger(options)) options = { timeout: options };
  let { timeout = 2000, interval = 10, remains } = options;

  let then = (...handlers) => new Promise((resolve, reject) => (
    async function retry(t, r) {
      try {
        let ret = await assertion();

        if (remains && (!r || now() - r <= remains))
          setTimeout(retry, interval, t, r || now());
        else
          resolve(ret);
      } catch (error) {
        if (r || now() - t <= timeout)
          setTimeout(retry, interval, t);
        else
          reject(error);
      }
    }(now())
  )).then(...handlers);

  return assign(then, {
    catch: f => then().catch(f),
    then
  });
}
