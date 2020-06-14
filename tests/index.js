require('regenerator-runtime/runtime');

// As much as it pains me to retry tests, the test suite can be flakey due to
// 1ms differences in expectation ranges and CI timing. 99% of the time, the test
// will pass with a single retry.
mocha.retries(1);
// Interactor timeouts are 2s, so just set the test 1s higher
mocha.timeout(3000);

const requireTest = require.context('.', true, /\.test/);
requireTest.keys().forEach(requireTest);
