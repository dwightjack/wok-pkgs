function getServer(hash) {
  const BrowserSync = require('browser-sync');
  if (!BrowserSync.has(hash)) {
    return BrowserSync.create(hash);
  }
  return BrowserSync.get(hash);
}

module.exports = (gulp, opts, env, api) => {
  const { compression } = require('./lib/middlewares');
  const { development = {} } = env.hosts || {};
  const { baseDir = ['public'] } = opts;

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

  api.hooks.set('serve:middlewares', 'compression', compression);

  function serve() {
    const bs = getServer(env);

    const middlewares = api.hooks.callWith(
      'serve:middlewares',
      new Map(),
      opts['hooks:middlewares'],
      bs,
    );

    const cfg = api.hooks.callWith(
      'serve:config',
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
        api.hooks.callWith('serve:running', server, opts['hooks:running']);
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

module.exports.getServer = getServer;
