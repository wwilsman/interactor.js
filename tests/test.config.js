export default {
  browser: 'Chrome',
  timeout: 10_000,

  plugins: [
    async test => {
      const { rollup } = await import('rollup');
      const { test: config } = await import('../rollup.config.js');

      let bundle = await rollup(config);
      let { output } = await bundle.generate(config.output);

      test.configure({
        serve: output.reduce((virtual, output) => {
          let { fileName, code, source } = output;
          virtual[`/${fileName}`] = code ?? source;
          return virtual;
        }, {})
      });

      test.on('test:abort', async () => {
        await bundle.close();
      });
    }
  ]
};
