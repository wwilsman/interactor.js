import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import html from '@rollup/plugin-html';
import globImport from 'rollup-plugin-glob-import';

export const build = {
  input: 'lib/index.js',
  output: {
    format: 'umd',
    exports: 'named',
    name: 'Interactor',
    file: 'dist/interactor.js'
  },
  plugins: [
    commonjs(),
    resolve({ browser: true, preferBuiltins: false }),
    babel({ babelHelpers: 'runtime' })
  ]
};

export const test = {
  input: 'tests/index.js',
  output: { format: 'iife', file: 'tests.js' },
  inlineDynamicImports: true,
  plugins: [
    html(),
    globImport(),
    ...build.plugins,
    {
      name: 'remove-node-process',
      transform: code => ({
        code: code.replace(/([^.])(process(\.env)?)(\.)?/g, '$1({})$4'),
        mape: null
      })
    }
  ]
};

export default build;
