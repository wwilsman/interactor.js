import { assign, now } from './utils';

// Repeatedly runs the assertion every interval until it does not throw an error or until the
// timeout is reached. Once passing, if `remains` is provided, the assertion will continue to run
// every interval throughout the `remains` period unless it throws an error again. This function
// returns a thennable function that runs the assertion when called or awaited on.
export default function when(assertion, { timeout, interval, remains }) {
  let then = () => new Promise((resolve, reject) => (
    function retry(t, r) {
      try {
        assertion();

        if (remains && now() - (r || t) <= remains) {
          setTimeout(retry, interval, t, r || now());
        } else {
          resolve();
        }
      } catch (error) {
        if (r || now() - t <= timeout) {
          setTimeout(retry, interval, t);
        } else {
          reject(error);
        }
      }
    }
  )(now()));

  return assign(then, { then });
}
