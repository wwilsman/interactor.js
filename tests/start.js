import createTestServer from 'moonshiner/server';
import middlewares from 'moonshiner/middlewares';
import reporters from 'moonshiner/reporters';
import browsers from 'moonshiner/browsers';
import cov from 'istanbul-lib-coverage';

// create test server
const testServer = createTestServer();

// use reporters
testServer.use(reporters.emoji());
testServer.use(reporters.createReporter({
  state: cov.createCoverageMap(),
  sync: false,

  'after:suite': (_, state, event) => {
    if (!event.__coverage__) return;
    state.merge(event.__coverage__);
    globalThis.__coverage__ = state.toJSON();
  }
}));

// use launchers
testServer.use(browsers.firefox());
testServer.use(browsers.chromium());
testServer.use(middlewares.launch(async server => {
  server.emit('console', 'log', ['Launching JSDOM']);
  let { JSDOM } = await import('jsdom');

  let dom = await JSDOM.fromURL(server.address(), {
    runScripts: 'dangerously',
    resources: 'usable'
  });

  return () => dom.window.close();
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
