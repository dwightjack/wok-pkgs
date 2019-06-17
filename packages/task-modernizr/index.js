module.exports = (
  gulp,
  { src = '', dest = '', filename = 'modernizr.js' },
  env,
) => {
  const customizr = require('gulp-modernizr');
  const srcPattern = env.pattern(src);
  const destFolder = env.resolve(dest);
  const { hooks } = env;

  return function modernizr() {
    return gulp
      .src(srcPattern)
      .pipe(customizr(filename, env.modernizr))
      .pipe(hooks.call('modernizr', env))
      .pipe(gulp.dest(destFolder));
  };
};
