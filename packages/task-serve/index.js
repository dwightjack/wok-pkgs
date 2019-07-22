/**
 * Sharable Node.js Server Task based on BrowserSync
 *
 * The `params` object accepts the following hook configuration keys:
 *
 * - `hooks:config` parameters passed to the `config` hook
 * - `hooks:middlewares` parameters passed to the `middlewares` hook
 * - `hooks:running` parameters passed to the `running` hook
 *
 * @param {Gulp} gulp Gulp instance
 * @param {object} params Task parameters
 * @param {string|string[]} [params.baseDir=['public']] Directories to serve
 * @param {object} env Wok environment object
 * @param {object} api Wok API object
 * @returns {function} Gulp tasks
 */
module.exports = function(gulp, params, env, api) {
  const { compression } = require('./lib/middlewares');
  const { getServer } = require('./lib/utils');
  const { development = {} } = env;
  const { baseDir = ['public'] } = params;
  const $hooks = this.getHooks();

  function createConfig(middlewares) {
    return {
      notify: false,
      ghostMode: false,
      port,
      server: {
        baseDir: api.pattern(baseDir),
      },
      middleware: [...middlewares.values()],
      snippetOptions: {
        async: true,
        whitelist: [],
        blacklist: [],
        rule: {
          match: /<\/head[^>]*>/i,
          fn(snippet, match) {
            if (env.livereload === false) {
              return match;
            }
            return snippet + match;
          },
        },
      },
    };
  }

  const { port = 8000 } = development;

  $hooks.set('middlewares', 'compression', compression);

  function serve() {
    const bs = getServer(env);

    const middlewares = $hooks.callWith(
      'middlewares',
      new Map(),
      params['hooks:middlewares'],
      bs,
    );

    const cfg = $hooks.callWith(
      'config',
      createConfig(middlewares),
      params['hooks:config'],
    );

    process.on('exit', () => {
      bs.exit();
    });

    return new Promise((resolve, reject) => {
      bs.init(cfg, (err, server) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
        $hooks.callWith('running', server, params['hooks:running']);
      });
    });
  }

  serve.getServer = getServer.bind(null, env);
  serve.reload = (arg) => {
    const bs = getServer(env);
    return function livereload(done) {
      bs.reload(arg);
      done();
    };
  };
  serve.stream = (options) => {
    const bs = getServer(env);
    return bs.stream.bind(bs, options);
  };

  return serve;
};
