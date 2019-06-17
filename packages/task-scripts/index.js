module.exports = (gulp, { src = '', dest = '', ...params }, env, api) => {
  const srcFolder = api.pattern(src);
  const destFolder = api.resolve(dest);
  const { production } = env;
  const { hooks } = api;

  return function scripts() {
    return gulp
      .src(srcFolder, { sourcemaps: production })
      .pipe(hooks.call('scripts:pre', params['hooks:pre']))
      .pipe(hooks.call('scripts:transform', params['hooks:transform']))
      .pipe(hooks.call('scripts:post', params['hooks:post']))
      .pipe(gulp.dest(destFolder, { sourcemaps: production && '.' }));
  };
};
