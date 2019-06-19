const { createPlugin } = require('wok-core/utils');

module.exports.compression = createPlugin({
  name: 'compression',
  productionOnly: true,
  plugin(middlewares) {
    middlewares.set('compression', require('compression')());
  },
});
