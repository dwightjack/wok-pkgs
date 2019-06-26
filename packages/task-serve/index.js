module.exports = function(gulp, opts, env, api) {
  const { compression } = require('./lib/middlewares');
  const { getServer } = require('./lib/utils');
  const { development = {} } = env.hosts || {};
  const { baseDir = ['public'] } = opts;
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
      opts['hooks:middlewares'],
      bs,
    );

    const cfg = $hooks.callWith(
      'config',
      createConfig(middlewares),
      opts['hooks:config'],
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
        $hooks.callWith('running', server, opts['hooks:running']);
      });
    });
  }

  serve.getServer = getServer.bind(null, env);
  serve.reload = () => {
    const bs = getServer(env);
    return function livereload(done) {
      bs.reload();
      done();
    };
  };

  return serve;
};
