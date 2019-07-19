/**
 * Base Sharable Task
 *
 * Use this task as base for specialized tasks
 *
 * The `params` object accepts the following hook configuration keys:
 *
 * - `hooks:process` parameters passed to the `process` hook
 * - `hooks:complete` parameters passed to the `complete` hook
 *
 * @param {Gulp} gulp Gulp instance
 * @param {object} params Task parameters
 * @param {string} params.name Name of the task
 * @param {string|string[]} params.src Source globs
 * @param {string} params.dest Destination folder
 * @param {string|boolean} [params.cache=false] Process just the files changed from the last execution
 * @param {object} env Wok environment object
 * @param {object} api Wok API object
 * @returns {function} Gulp tasks
 */
module.exports = function baseTask(
  gulp,
  { src = [], dest = '', name = '<task>', cache = false, ...params },
  env,
  api,
) {
  const { logger, noopStream } = require('@wok-cli/core/utils');
  const folders = api.pattern(src);
  let destFolder;
  const $hooks = this.getHooks();

  try {
    destFolder = api.resolve(dest);
  } catch (e) {
    logger.error(`Destination folder not available`, e);
    return;
  }

  return Object.defineProperty(
    function base() {
      return gulp
        .src(folders, {
          dot: true,
          since: cache ? gulp.lastRun(base) : undefined,
        })
        .pipe($hooks.call('process', params['hooks:process']))
        .pipe(gulp.dest(destFolder))
        .pipe($hooks.call('complete', params['hooks:complete']))
        .pipe(noopStream()); // adds a noop stream to fix this error: https://stackoverflow.com/questions/40098156/what-about-this-combination-of-gulp-concat-and-lazypipe-is-causing-an-error-usin/40101404#40101404
    },
    'name',
    { value: name },
  );
};
