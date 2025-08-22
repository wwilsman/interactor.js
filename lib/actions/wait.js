/**
 * @param {number} timeout
 * @returns {import('../context').ContextGenerator}
 */
export function* wait(timeout) {
  if (!timeout) return;

  let start = Date.now();
  let interval = 1000 / 60;

  while (Date.now() - start < timeout)
    yield new Promise(r => setTimeout(r, interval));
}

export default wait;
