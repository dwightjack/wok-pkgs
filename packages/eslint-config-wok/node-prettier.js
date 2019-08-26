const config = require('./node');

module.exports = {
  ...config,
  extends: [...config.extends, 'plugin:prettier/recommended'],
};
