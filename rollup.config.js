import babel from '@rollup/plugin-babel';

export default {
  input: 'lib/index.js',
  output: {
    format: 'umd',
    exports: 'named',
    name: 'Interactor',
    file: 'bundle/interactor.js'
  },
  plugins: [
    babel({ babelHelpers: 'runtime' })
  ]
};
