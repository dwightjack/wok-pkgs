module.exports = (gulp, { src = '', dest = '', ...params }, env, api) => {
  const srcFolder = api.pattern(src);
  const destFolder = api.resolve(dest);
  const postcssHook = require('./lib/postcss');
  const { production } = env;
  const { hooks } = api;

  hooks.tap('styles:post', 'postcss', postcssHook);

  return function styles() {
    return gulp
      .src(srcFolder, { sourcemaps: production })
      .pipe(hooks.call('styles:pre', params['hooks:pre']))
      .pipe(hooks.call('styles:post', params['hooks:post']))
      .pipe(gulp.dest(destFolder, { sourcemaps: production && '.' }));
  };
};
