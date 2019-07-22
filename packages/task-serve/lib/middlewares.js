/**
 * @module Middlewares
 */

const { createPlugin } = require('@wok-cli/core/utils');

/**
 * Wok plugin that adds a HTTP compression middleware in production
 *
 * @see https://www.npmjs.com/package/compression
 * @type {function}
 */
module.exports.compression = createPlugin({
  name: 'compression',
  productionOnly: true,
  plugin(middlewares) {
    return middlewares.set('compression', require('compression')());
  },
});
