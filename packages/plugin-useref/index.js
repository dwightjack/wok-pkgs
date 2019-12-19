const { createPlugin, pipeChain } = require('@wok-cli/core/utils');

const transforms = {
  /**
   * Replaces the contained script(s) with the passed-in one.
   *
   * @param {string} blockContent Build tag content
   * @param {string} target Destination URI
   * @param {string} attrs script attributes
   * @example
   * <!-- Replace the development version of modernizr with the production one -->
   * <!-- build:replace /vendors/modernizr.min.js -->
   * <script src="/vendors/modernizr.js"></script>
   * <!-- endbuild -->
   */
  replace: (blockContent, target, attrs) =>
    `<script src="${target}"${attrs ? ` ${attrs}` : ''}></script>`,
};

/**
 * gulp-useref implementation for Wok
 *
 * @param {Lazypipe} lazypipe Hook accumulator
 * @param {object} env Wok environment configuration object
 * @param {object} api Wok internal API
 * @param {object} params Plugin parameters. Any non-listed option will be passed to gulp-useref as option.
 * @param {boolean} [params.sourcemaps=env.sourcemaps] Sourcemaps support.
 * @returns {lazypipe}
 */
function userefPlugin(lazypipe, env, api, opts) {
  const useref = require('gulp-useref');
  const gulpMaps = require('gulp-sourcemaps');

  const { sourcemaps = env.sourcemaps, ...options } = opts;

  options.searchPath = options.searchPath && api.pattern(options.searchPath);
  options.base = options.base && api.resolve(options.base);

  const userefOpts = {
    ...transforms,
    ...options,
  };

  if (sourcemaps) {
    return lazypipe
      .pipe(() =>
        useref(userefOpts, pipeChain().pipe(gulpMaps.init, { loadMaps: true })),
      )
      .pipe(
        gulpMaps.write,
        // always output external sourcemaps
        typeof sourcemaps === 'string' ? sourcemaps : '.',
      );
  }

  return lazypipe.pipe(useref, userefOpts);
}

module.exports = createPlugin({
  name: 'useref',
  productionOnly: true,
  plugin: userefPlugin,
});
