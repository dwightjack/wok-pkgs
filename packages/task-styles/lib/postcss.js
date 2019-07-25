const { createPlugin } = require('@wok-cli/core/utils');

/**
 * PostCSS Hook Plugin
 *
 * @param {lazypipe} stream Input lazypipe instance
 * @param {object} env Wok environment object
 * @param {object} api Wok API object
 * @param {array} [opts] Array of custom PostCSS plugins
 * @return {lazypipe}
 */
function postcss(stream, { production }, api, opts) {
  /**
   * Default plugins
   *
   * @return {Array}
   */
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

  const plugins = Array.isArray(opts) ? opts : defaultPlugins();
  return stream.pipe(
    require('gulp-postcss'),
    plugins,
  );
}

module.exports = createPlugin({
  name: 'postcss',
  plugin: postcss,
});
