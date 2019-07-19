const { createTask } = require('../index');

/**
 * Sharable Copy Task
 *
 * The `params` object accepts the following hook configuration keys:
 *
 * - `hooks:process` parameters passed to the `process` hook
 * - `hooks:complete` parameters passed to the `complete` hook
 *
 * @param {Gulp} gulp Gulp instance
 * @param {object} params Task parameters
 * @param {string|string[]} params.src Source globs
 * @param {string} params.dest Destination folder
 * @param {string|boolean} [params.cache=true] Process just the files changed from the last execution
 * @param {object} env Wok environment object
 * @param {object} api Wok API object
 * @returns {function} Gulp tasks
 */
module.exports = createTask('copy', { cache: true });
