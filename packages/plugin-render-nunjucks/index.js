const { createPlugin } = require('@wok-cli/core/utils');
const nunjucksEnv = require('./lib/env');

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

module.exports = createPlugin({
  name: 'nunjucks',
  plugin: nunjucks,
});
