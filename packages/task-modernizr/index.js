/**
 * Sharable Modernizr Task
 *
 * The `params` object accepts the following hook configuration keys:
 *
 * - `hooks:generated` parameters passed to the `generated` hook
 *
 * @param {Gulp} gulp Gulp instance
 * @param {object} params Task parameters
 * @param {string|string[]} params.src Source globs
 * @param {string} params.dest Custom modernizr build destination folder
 * @param {string|boolean} [params.filename='modernizr.js'] Build filename
 * @param {object} env Wok environment object
 * @param {object} api Wok API object
 * @returns {function} Gulp tasks
 */
module.exports = function(
  gulp,
  { src = '', dest = '', filename = 'modernizr.js', ...params },
  env,
  api,
) {
  const srcPattern = api.pattern(src);
  const destFolder = api.resolve(dest);
  const $hooks = this.getHooks();

  return function modernizr() {
    const customizr = require('gulp-modernizr');
    return gulp
      .src(srcPattern)
      .pipe(customizr(filename, params))
      .pipe($hooks.call('generated', params['hooks:generated']))
      .pipe(gulp.dest(destFolder));
  };
};
