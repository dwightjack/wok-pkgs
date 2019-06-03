module.exports = (gulp, { src = '', dest = '' }, env) => {
  const postcss = require('gulp-postcss');
  const srcFolder = env.pattern(src);
  const destFolder = env.resolve(dest);
  const { production, hooks } = env;

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
      .pipe(hooks.call('styles:pre', env))
      .pipe(hooks.call('styles:post', env))
      .pipe(gulp.dest(destFolder, { sourcemaps: production && '.' }));
  };
};
