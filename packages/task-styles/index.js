module.exports = (gulp, { src = '', dest = '', ...params }, env, api) => {
  const postcss = require('gulp-postcss');
  const srcFolder = api.pattern(src);
  const destFolder = api.resolve(dest);
  const { production } = env;
  const { hooks } = api;

  function defaultPlugins() {
    const plugins = [require('autoprefixer')()];
    if (production) {
      plugins.push(
        require('cssnano')({
          preset: 'default',
        }),
      );
    }
    return plugins;
  }

  hooks.tap('styles:post', 'postcss', (chain, env) => {
    const plugins = env.postcss || defaultPlugins();
    return chain.pipe(
      postcss,
      plugins,
    );
  });

  return function styles() {
    return gulp
      .src(srcFolder, { sourcemaps: production })
      .pipe(hooks.call('styles:pre', params['hooks:pre']))
      .pipe(hooks.call('styles:post', params['hooks:post']))
      .pipe(gulp.dest(destFolder, { sourcemaps: production && '.' }));
  };
};
