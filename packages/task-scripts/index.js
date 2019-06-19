module.exports = (
  gulp,
  { src = '', dest = '', sourcemaps = '.', ...params },
  env,
  api,
) => {
  const srcFolder = api.pattern(src);
  const destFolder = api.resolve(dest);
  const { hooks } = api;

  return function scripts() {
    return gulp
      .src(srcFolder, { sourcemaps: !!sourcemaps })
      .pipe(hooks.call('scripts:pre', params['hooks:pre']))
      .pipe(hooks.call('scripts:transform', params['hooks:transform']))
      .pipe(hooks.call('scripts:post', params['hooks:post']))
      .pipe(gulp.dest(destFolder, { sourcemaps }));
  };
};
