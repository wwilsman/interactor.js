module.exports = (config) => {
  config.set({
    frameworks: ['mocha'],
    browsers: ['ChromeHeadless'],

    reporters: [
      'mocha',
      'coverage',
      config.junit && 'junit'
    ].filter(Boolean),

    files: [
      { pattern: 'tests/index.js', watched: false }
    ],

    preprocessors: {
      'tests/index.js': ['webpack']
    },

    mochaReporter: {
      showDiff: true
    },

    coverageReporter: {
      type: config.coverage === true
        ? 'text-summary'
        : (config.coverage || 'none'),
      check: config.converage ? {
        global: {
          statements: 100,
          lines: 100,
          functions: 100,
          branches: 100
        }
      } : undefined,
      watermarks: {
        statements: [100, 100],
        functions: [100, 100],
        branches: [100, 100],
        lines: [100, 100]
      }
    },

    junitReporter: {
      outputDir: './junit',
      outputFile: 'test-results.xml',
      useBrowserName: false
    },

    webpack: {
      mode: 'none',

      module: {
        rules: [{
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        }]
      }
    },

    webpackMiddleware: {
      stats: 'minimal'
    },

    plugins: [
      'karma-chrome-launcher',
      'karma-coverage',
      'karma-jsdom-launcher',
      'karma-junit-reporter',
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-webpack'
    ]
  });
};
