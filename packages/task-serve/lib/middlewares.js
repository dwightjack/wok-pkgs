const { createPlugin } = require('@wok-cli/core/utils');

module.exports.compression = createPlugin({
  name: 'compression',
  productionOnly: true,
  plugin(middlewares) {
    middlewares.set('compression', require('compression')());
  },
});
