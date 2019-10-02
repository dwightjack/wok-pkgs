function minifyJS(gulp, { pattern = [], ...opts }, env, api) {
  const terser = require('gulp-minify');
  const options = Object.assign(
    { preserveComments: 'some', ext: '.js', noSource: true },
    opts,
  );

  return function minify() {
    return gulp
      .src(api.pattern(pattern))
      .pipe(terser(options))
      .pipe(gulp.dest(({ base }) => base));
  };
}

module.exports = { minifyJS };
