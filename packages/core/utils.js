const log = require('fancy-log');
const { red, yellow } = require('ansi-colors');
const template = require('lodash/template');

const logger = {
  msg: (str) => log(red(str)),
  error: (str) => log(red(str)),
  warn: (str) => log(yellow(str)),
};

const resolveTemplate = (str, data) => template(str)(data);

const resolvePatterns = (patterns, data) => {
  const tmpl = (p) => resolveTemplate(p, data);
  return [].concat(patterns).map(tmpl);
};

module.exports = { logger, resolvePatterns, resolveTemplate };
