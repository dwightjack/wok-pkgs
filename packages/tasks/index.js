const base = require('./lib/base');
const copy = require('./lib/copy');
const clean = require('./lib/clean');
const noop = require('./lib/noop');
const deploy = require('./lib/deploy');
const { createTask } = require('./lib/utils');

module.exports = {
  copy,
  clean,
  noop,
  base,
  deploy,
  createTask,
};
