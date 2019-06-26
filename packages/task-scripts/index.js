module.exports = function(
  gulp,
  { src = '', dest = '', sourcemaps = '.', ...params },
  env,
  api,
) {
  const srcFolder = api.pattern(src);
  const destFolder = api.resolve(dest);
  const $hooks = this.getHooks();

  return function scripts() {
    return gulp
      .src(srcFolder, { sourcemaps: !!sourcemaps })
      .pipe($hooks.call('pre', params['hooks:pre']))
      .pipe($hooks.call('transform', params['hooks:transform']))
      .pipe($hooks.call('post', params['hooks:post']))
      .pipe(gulp.dest(destFolder, { sourcemaps }));
  };
};
