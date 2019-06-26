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
