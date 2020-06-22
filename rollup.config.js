import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';

export default {
  input: 'src/index.js',
  output: [{
    format: 'umd',
    exports: 'named',
    name: 'Interactor',
    file: pkg.main
  }, {
    format: 'module',
    file: pkg.module
  }],
  plugins: [
    commonjs(),
    resolve(),
    babel({ babelHelpers: 'runtime' })
  ]
};
