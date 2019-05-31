module.exports = (gulp, { src = '', dest = '', postcssPlugins }, env) => {
  const { resolvePatterns, resolvePath } = require('wok-core/utils');
  const postcss = require('gulp-postcss');
  const srcFolder = resolvePatterns(src, env);
  const destFolder = resolvePath(dest, env);
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

  hooks.tap('styles:post', 'postcss', (chain) => {
    const plugins = postcssPlugins || defaultPlugins();
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
