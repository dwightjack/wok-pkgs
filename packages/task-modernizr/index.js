module.exports = (
  gulp,
  { src = '', dest = '', filename = 'modernizr.js' },
  env,
) => {
  const { resolvePatterns, resolvePath } = require('wok-core/utils');
  const modernizr = require('gulp-modernizr');
  const srcFolder = resolvePatterns(src, env);
  const destFolder = resolvePath(dest, env);
  const { hooks } = env;

  return function scripts() {
    return gulp
      .src(srcFolder)
      .pipe(modernizr(filename, env.modernizr))
      .pipe(hooks.call('modernizr', env))
      .pipe(gulp.dest(destFolder));
  };
};
