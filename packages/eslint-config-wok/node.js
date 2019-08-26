module.exports = {
  extends: ['eslint:recommended', 'plugin:node/recommended'],
  env: {
    node: true,
  },
  rules: {
    'no-console': 0,
    'node/no-unpublished-require': 0,
  },
};
