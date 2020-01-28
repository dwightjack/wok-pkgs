const $ = require('@wok-cli/core');

module.exports = $.preset([
  '@wok-cli/preset-standard',
  '@wok-cli/preset-wok',
]).resolve();
