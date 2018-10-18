module.exports = (config) => {
  config.set({
    frameworks: ['mocha'],
    reporters: ['mocha'],
    browsers: ['Chrome'],

    files: [
      { pattern: 'tests/index.js', watched: false }
    ],

    preprocessors: {
      'tests/index.js': ['webpack']
    },

    mochaReporter: {
      showDiff: true
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
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-webpack'
    ]
  });
};
