import createTestServer from 'moonshiner/server';
import middlewares from 'moonshiner/middlewares';
import reporters from 'moonshiner/reporters';
import browsers from 'moonshiner/browsers';

const testServer = createTestServer();
testServer.use(reporters.emoji());

testServer.use(middlewares.launch(async server => {
  server.emit('console', 'log', ['Launching JSDOM']);
  let { JSDOM } = await import('jsdom');

  let dom = await JSDOM.fromURL(server.address(), {
    runScripts: 'dangerously',
    resources: 'usable'
  });

  return () => dom.window.close();
}));

testServer.use(browsers.firefox());
testServer.use(browsers.chromium());

testServer.use(middlewares.listen(async () => {
  let { rollup } = await import('rollup');
  let { test: config } = await import('../rollup.config.js');
  let { default: cov } = await import('istanbul-lib-coverage');

  let bundle = await rollup(config);
  let coverage = cov.createCoverageMap();
  let { output } = await bundle.generate(config.output);

  testServer.use(middlewares.serve({
    virtual: output.reduce((virtual, output) => {
      let { fileName, code, source } = output;
      virtual[`/${fileName}`] = code ?? source;
      return virtual;
    }, {})
  }));

  testServer.use((event, next) => (event.data?.coverage && (
    coverage.merge(event.data.coverage),
    globalThis.__coverage__ = coverage.toJSON()
  ), next()));

  return async () => {
    await bundle.close();
  };
}));

testServer.listen();
