const config = require('./web');

module.exports = {
  ...config,
  extends: [...config.extends, 'plugin:prettier/recommended'],
};
