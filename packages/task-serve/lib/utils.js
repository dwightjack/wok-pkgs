/**
 * @module Utils
 */

/**
 * Returns a BrowserSync instance by hash.
 *
 * If the instance has not been created it will be initialized.
 *
 * @param {string} hash BrowserSync instance unique hash
 * @returns {BrowserSync}
 */
function getServer(hash) {
  const BrowserSync = require('browser-sync');
  if (!BrowserSync.has(hash)) {
    return BrowserSync.create(hash);
  }
  return BrowserSync.get(hash);
}

module.exports = {
  getServer,
};
