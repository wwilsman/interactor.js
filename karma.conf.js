module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],
    browsers: ['ChromeHeadless'],
    singleRun: true,

    reporters: [
      'mocha',
      'coverage',
      config.junit && 'junit'
    ].filter(Boolean),

    files: [
      { pattern: 'src/index.js', watched: false },
      { pattern: 'tests/helpers.js', watched: false },
      { pattern: 'tests/**/*.test.js', watched: false }
    ],

    preprocessors: {
      'src/index.js': ['rollup'],
      'tests/helpers.js': ['rollupTestHelpers'],
      'tests/**/*.test.js': ['rollupTest']
    },

    client: {
      mocha: {
        timeout: false
      }
    },

    mochaReporter: {
      showDiff: true
    },

    coverageReporter: {
      type: config.coverage === true ? 'text'
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

    rollupPreprocessor: {
      plugins: [
        require('@rollup/plugin-commonjs')(),
        require('@rollup/plugin-node-resolve').default({
          preferBuiltins: false
        }),
        require('@rollup/plugin-babel').default({
          babelHelpers: 'runtime'
        })
      ],

      output: {
        format: 'umd',
        exports: 'named',
        name: 'Interactor',
        sourcemap: 'inline'
      }
    },

    customPreprocessors: {
      rollupTestHelpers: {
        base: 'rollup',
        options: {
          output: {
            name: 'TestHelpers',
            format: 'iife',
            exports: 'named',
            sourcemap: 'inline',
            // fixes browserify's assert
            intro: `window.process = {
              nextTick: fn => setTimeout(fn, 0),
              env: {}
            };`
          },

          // circular deps are noisy in test libraries
          onwarn: message => {
            if (/circular dependency/i.test(message)) return;
            console.warn(message);
          }
        }
      },

      rollupTest: {
        base: 'rollup',
        options: {
          external: [
            'interactor.js',
            'tests/helpers'
          ],

          output: {
            name: 'Tests',
            format: 'iife',
            sourcemap: 'inline',
            globals: {
              'interactor.js': 'Interactor',
              'tests/helpers': 'TestHelpers'
            }
          }
        }
      }
    },

    plugins: [
      'karma-chrome-launcher',
      'karma-coverage',
      'karma-firefox-launcher',
      'karma-jsdom-launcher',
      'karma-junit-reporter',
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-rollup-preprocessor'
    ]
  });
};
