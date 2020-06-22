module.exports = {
  comments: false,
  presets: [
    ['@babel/env', {
      modules: false,
      targets: ['defaults']
    }]
  ],
  plugins: [
    '@babel/transform-runtime'
  ],
  env: {
    test: {
      plugins: [
        'istanbul'
      ]
    }
  }
};
