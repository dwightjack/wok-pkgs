const fns = require('./lib/functions');
const { createPlugin } = require('@wok-cli/core/utils');

/**
 * Sass pre-processor plugin
 *
 * @param {Lazypipe} lazypipe Hook accumulator
 * @param {object} env Wok environment configuration object
 * @param {object} api Wok internal API
 * @param {object} params Plugin parameters. Any non-listed option will be passed to node-sass as option.
 * @param {string} [params.includePaths=['node_modules']] Include paths. See https://github.com/sass/node-sass#includepaths
 * @param {function} [params.functions] A function returning an object with custom Sass functions
 * @returns {lazypipe}
 */
function sass(lazypipe, env, api, opts) {
  const { includePaths = ['node_modules'], functions, ...options } = opts;

  return lazypipe.pipe(
    require('gulp-sass'),
    {
      precision: 10,
      includePaths: api.pattern(includePaths),
      outputStyle: 'expanded',
      functions: (typeof functions === 'function' ? functions : fns)(env, api),
      ...options,
    },
  );
}

module.exports = createPlugin({
  name: 'sass',
  plugin: sass,
});
