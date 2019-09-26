/**
 * Sharable CSS Styles Task
 *
 * The `params` object accepts the following hook configuration keys:
 *
 * - `hooks:pre` parameters passed to the `pre` hook
 * - `hooks:post` parameters passed to the `post` hook
 * - `hooks:complete` parameters passed to the `complete` hook
 *
 * @param {Gulp} gulp Gulp instance
 * @param {object} params Task parameters
 * @param {string|string[]} params.src Source globs
 * @param {string} params.dest Destination folder
 * @param {string|boolean} [params.sourcemaps=env.sourcemaps] Sourcemap file location. Set to `false` to disable sourcemaps generation.
 * @param {object} env Wok environment object
 * @param {object} api Wok API object
 * @returns {function} Gulp tasks
 */
module.exports = function(gulp, params, env, api) {
  let { src = '', dest = '', sourcemaps = env.sourcemaps, ...rest } = params;
  const srcFolder = api.pattern(src);
  const destFolder = api.resolve(dest);
  const postcssHook = require('./lib/postcss');
  const $hooks = this.getHooks();
  const { noopStream } = require('@wok-cli/core/utils');

  $hooks.tap('post', 'postcss', postcssHook);

  return function styles() {
    return gulp
      .src(srcFolder, { sourcemaps: !!sourcemaps })
      .pipe($hooks.call('pre', rest['hooks:pre']))
      .pipe($hooks.call('post', rest['hooks:post']))
      .pipe(gulp.dest(destFolder, { sourcemaps }))
      .pipe($hooks.call('complete', rest['hooks:complete']))
      .pipe(noopStream()); // adds a noop stream to fix this error: https://stackoverflow.com/questions/40098156/what-about-this-combination-of-gulp-concat-and-lazypipe-is-causing-an-error-usin/40101404#40101404
  };
};
