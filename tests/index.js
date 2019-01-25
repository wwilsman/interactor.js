require('@babel/polyfill');
const requireTest = require.context('.', true, /\.test/);
requireTest.keys().forEach(requireTest);
