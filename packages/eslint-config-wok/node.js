module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:prettier/recommended',
  ],
  env: {
    node: true,
  },
  rules: {
    'no-console': 0,
    'node/no-unpublished-require': 0,
  },
};
