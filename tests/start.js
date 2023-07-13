import createTestServer from 'moonshiner/server';
import middlewares from 'moonshiner/middlewares';
import reporters from 'moonshiner/reporters';
import launch from 'moonshiner/launchers';
import cov from 'istanbul-lib-coverage';

// create test server
const testServer = createTestServer();

// use reporters
testServer.use(reporters.emoji());
testServer.use(reporters.createReporter({
  state: cov.createCoverageMap(),
  sync: false,

  'after:suite'(_, state, event) {
    if (!event.__coverage__) return;
    state.merge(event.__coverage__);
    globalThis.__coverage__ = state.toJSON();
  }
}));

// use launchers
testServer.use(launch.firefox());
testServer.use(launch.chrome());
testServer.use(launch.fork('JSDOM', {
  modulePath: './tests/jsdom.js'
}));

// use bundler
testServer.use(middlewares.listen(async () => {
  let { rollup } = await import('rollup');
  let { test: config } = await import('../rollup.config.js');

  let bundle = await rollup(config);
  let { output } = await bundle.generate(config.output);

  // serve bundle output
  testServer.use(middlewares.serve({
    virtual: output.reduce((virtual, output) => {
      let { fileName, code, source } = output;
      virtual[`/${fileName}`] = code ?? source;
      return virtual;
    }, {})
  }));

  return async () => {
    await bundle.close();
  };
}));

// start test server
testServer.listen();
