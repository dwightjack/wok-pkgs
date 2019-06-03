module.exports = (
  gulp,
  { src = '', dest = '', filename = 'modernizr.js' },
  env,
) => {
  const modernizr = require('gulp-modernizr');
  const srcPattern = env.pattern(src);
  const destFolder = env.resolve(dest);
  const { hooks } = env;

  return function scripts() {
    return gulp
      .src(srcPattern)
      .pipe(modernizr(filename, env.modernizr))
      .pipe(hooks.call('modernizr', env))
      .pipe(gulp.dest(destFolder));
  };
};
