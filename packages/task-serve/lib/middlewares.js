/**
 * @module Middlewares
 */

const { createPlugin } = require('@wok-cli/core/utils');

/**
 * WOK plugin that adds a HTTP compression middleware in production
 *
 * @see https://www.npmjs.com/package/compression
 * @type {function}
 */
module.exports.compression = createPlugin({
  name: 'compression',
  productionOnly: true,
  plugin(middlewares) {
    middlewares.set('compression', require('compression')());
  },
});
