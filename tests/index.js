require('@babel/polyfill');

mocha.timeout(3000);
const requireTest = require.context('.', true, /\.test/);
requireTest.keys().forEach(requireTest);
