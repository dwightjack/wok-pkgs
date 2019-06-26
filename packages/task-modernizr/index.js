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
