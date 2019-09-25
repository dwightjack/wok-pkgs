const { createPlugin } = require('@wok-cli/core/utils');
const nunjucksEnv = require('./lib/env');

/**
 * Nunjucks template renderer
 *
 * @param {Map} engines Hook accumulator
 * @param {object} env Wok environment configuration object
 * @param {object} api Wok internal API
 * @param {object} params Plugin parameters.
 * @param {string} [params.root] Templates base folder
 * @param {Helpers} [params.helpers] Function returning helpers
 * @param {function} [params.env] Nunjucks environment customizer. Receives a Nunjucks environment as argument.
 * @returns {*}
 */

function nunjucks(engines, env, api, opts) {
  return engines.set('nunjucks', function createRenderer() {
    let _env;

    const { root, helpers, env: envFn, ...options } = opts;

    return {
      name: 'nunjucks',
      test: /\.(njk|nunjucks)$/,
      render(string, locals) {
        try {
          // lazy load renderer
          if (!_env) {
            _env = nunjucksEnv(root && api.pattern(root), options);
            _env.addGlobal(
              'helpers',
              typeof helpers === 'function' ? helpers(options, env) : {},
            );

            _env.addGlobal('url', (str) =>
              `${env.publicPath}/${str}`.replace(/\/+/g, '/'),
            );

            if (typeof envFn === 'function') {
              envFn(_env);
            }
          }
          return _env.renderString(string, locals);
        } catch (e) {
          console.error(e);
        }
      },
    };
  });
}

/**
 * @typedef Helpers
 * @function
 * @param {object} [params] Nunjucks environment configuration options
 * @param {object} env Wok environment configuration object
 * @returns {object}
 */

module.exports = createPlugin({
  name: 'nunjucks',
  plugin: nunjucks,
});
