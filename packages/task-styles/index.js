module.exports = (
  gulp,
  { src = '', dest = '', sourcemaps = '.', ...params },
  env,
  api,
) => {
  const srcFolder = api.pattern(src);
  const destFolder = api.resolve(dest);
  const postcssHook = require('./lib/postcss');
  const { hooks } = api;

  hooks.tap('styles:post', 'postcss', postcssHook);

  return function styles() {
    return gulp
      .src(srcFolder, { sourcemaps: !!sourcemaps })
      .pipe(hooks.call('styles:pre', params['hooks:pre']))
      .pipe(hooks.call('styles:post', params['hooks:post']))
      .pipe(gulp.dest(destFolder, { sourcemaps }));
  };
};
