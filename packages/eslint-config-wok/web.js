module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: ['airbnb-base'],
  parser: 'babel-eslint',
  rules: {
    'no-multiple-empty-lines': [2, { max: 3 }],
    'arrow-body-style': 0,
    'class-methods-use-this': 0,
  },
};
