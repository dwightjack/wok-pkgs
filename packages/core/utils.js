const log = require('fancy-log');
const { red, yellow } = require('ansi-colors');

const logger = {
  msg: (str) => log(red(str)),
  error: (str) => log(red(str)),
  warn: (str) => log(yellow(str)),
};

module.exports.logger = logger;
