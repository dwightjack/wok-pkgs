module.exports = (
  gulp,
  { src = '', dest = '', filename = 'modernizr.js', ...options },
  env,
  api,
) => {
  const customizr = require('gulp-modernizr');
  const srcPattern = api.pattern(src);
  const destFolder = api.resolve(dest);

  return function modernizr() {
    return gulp
      .src(srcPattern)
      .pipe(customizr(filename, options))
      .pipe(api.hooks.call('modernizr:after', options['hooks:after']))
      .pipe(gulp.dest(destFolder));
  };
};
