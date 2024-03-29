import createTestServer from 'moonshiner/server';
import middlewares from 'moonshiner/middlewares';
import reporters from 'moonshiner/reporters';
import launch from 'moonshiner/launchers';
import cov from 'istanbul-lib-coverage';

// create test server
const testServer = createTestServer({
  debug: process.argv.includes('--debug')
});

// use reporters
testServer.use(reporters.emoji());
testServer.use(reporters.coverage({
  map: cov.createCoverageMap()
}));

// use launchers (firefox via flag, chrome by default)
if (process.argv.includes('--firefox'))
  testServer.use(launch.firefox());
else testServer.use(launch.chrome());

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
