/**
 * Sharable Script Task
 *
 * The `params` object accepts the following hook configuration keys:
 *
 * - `hooks:pre` parameters passed to the `pre` hook
 * - `hooks:transform` parameters passed to the `transform` hook
 * - `hooks:post` parameters passed to the `post` hook
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
  const { src = '', dest = '', sourcemaps = env.sourcemaps, ...rest } = params;
  const srcFolder = api.pattern(src);
  const destFolder = api.resolve(dest);
  const $hooks = this.getHooks();

  return function scripts() {
    return gulp
      .src(srcFolder, { sourcemaps: !!sourcemaps })
      .pipe($hooks.call('pre', rest['hooks:pre']))
      .pipe($hooks.call('transform', rest['hooks:transform']))
      .pipe($hooks.call('post', rest['hooks:post']))
      .pipe(gulp.dest(destFolder, { sourcemaps }));
  };
};
