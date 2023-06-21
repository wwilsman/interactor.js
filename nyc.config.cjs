module.exports = {
  reporter: process.env.NYC_REPORTER ?? 'text-summary',
  exclude: ['public', 'mocks', 'tests'],
  checkCoverage: true,
  instrument: false,
  branches: 100,
  lines: 100,
  functions: 100,
  statements: 100
};
