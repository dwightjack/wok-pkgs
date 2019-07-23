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
  const { noopStream } = require('@wok-cli/core/utils');
  const { devServer = {} } = env;
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

  const { port = 8000 } = devServer;

  $hooks.set('middlewares', 'compression', compression);

  function serve() {
    const bs = getServer(env.buildHash);

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

  serve.getServer = getServer.bind(null, env.buildHash);
  serve.reload = (arg) => {
    if (env.livereload === false) {
      return function livereload() {
        return Promise.resolve();
      };
    }
    const bs = getServer(env.buildHash);
    return function livereload(done) {
      bs.reload(arg);
      done();
    };
  };
  serve.stream = (options) => {
    if (env.livereload === false) {
      return noopStream;
    }
    const bs = getServer(env.buildHash);
    return bs.stream.bind(bs, options);
  };

  return serve;
};
