module.exports = (gulp, { src = '', dest = '' }, env) => {
  const srcFolder = env.pattern(src);
  const destFolder = env.resolve(dest);
  const { production, hooks } = env;

  return function scripts() {
    return gulp
      .src(srcFolder, { sourcemaps: production })
      .pipe(hooks.call('scripts:transform', env))
      .pipe(hooks.call('scripts:post', env))
      .pipe(gulp.dest(destFolder, { sourcemaps: production && '.' }));
  };
};
