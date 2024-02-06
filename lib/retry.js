function waitForTimeout(timeout, value) {
  return new Promise(r => setTimeout(r, timeout, value));
}

export async function* retry(fn, ...args) {
  let { timeout, frequency, reliability: rel } = yield ({ assert }) => assert;
  let error = new Error('Timeout exceeded');
  let interval = 1000 / frequency;
  let start = Date.now();
  let result;

  while (true) {
    if (Date.now() - start >= timeout)
      throw error;

    try {
      result = yield fn(...args);
    } catch (e) {
      error = e;
    }

    if (!result) await waitForTimeout(interval);
    else if (rel) await waitForTimeout(interval, rel -= 1);
    else return result;
  }
}

export default retry;
