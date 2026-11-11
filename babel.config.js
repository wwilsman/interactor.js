export default {
  comments: false,
  presets: [
    ['@babel/env', {
      modules: false,
      targets: ['defaults']
    }]
  ],
  plugins: [
    '@babel/transform-runtime'
  ]
};
