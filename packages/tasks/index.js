const base = require('./lib/base');
const copy = require('./lib/copy');
const clean = require('./lib/clean');
const noop = require('./lib/noop');
const deploy = require('./lib/deploy');
/**
 * Creates a named task from the base task.
 *
 * @param {string} name Task name
 * @param {object<string,*>} [defs] Task default parameters
 * @returns {function}
 */
function createTask(name, defs) {
  return function(gulp, params = {}, ...args) {
    return base.call(this, gulp, { ...params, ...defs, name }, ...args);
  };
}

module.exports = {
  copy,
  clean,
  noop,
  base,
  deploy,
  createTask,
};
