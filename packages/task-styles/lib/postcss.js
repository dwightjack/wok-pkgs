const { createPlugin } = require('@wok-cli/core/utils');

function postcss(stream, { production }, api, opts) {
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

  const plugins = opts.plugins || defaultPlugins();
  return stream.pipe(
    require('gulp-postcss'),
    plugins,
  );
}

module.exports = createPlugin({
  name: 'postcss',
  plugin: postcss,
});
