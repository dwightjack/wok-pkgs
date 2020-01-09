/**
 * Sharable Script Task
 *
 * The `params` object accepts the following hook configuration keys:
 *
 * - `hooks:pre` parameters passed to the `pre` hook
 * - `hooks:transform` parameters passed to the `transform` hook
 * - `hooks:post` parameters passed to the `post` hook
 *
 * @param {Gulp} gulp Gulp instance
 * @param {object} params Task parameters
 * @param {object} params.src Webpack entries
 * @param {string} params.outputFolder Webpack output folder
 * @param {string|boolean} [params.context=process.cwd()] Webpack compiler context folder
 * @param {object} env Wok environment object
 * @param {object} api Wok API object
 * @returns {function} Gulp tasks
 */

module.exports = function webpackTask(
  gulp,
  { entry = {}, outputFolder = '', context = process.cwd() },
  { production, publicPath },
  api,
) {
  const { resolve } = require('path');
  const { logger } = require('@wok-cli/core/utils');
  const Config = require('webpack-chain');
  const $hooks = this.getHooks();
  const ctx = api.resolve(context);

  $hooks.tap('completed', 'log', (stats) => {
    if (stats.hasErrors()) {
      logger.error(stats.toString('minimal'));
    } else {
      console.log(stats.toString('normal'));
    }
    return stats;
  });

  function createConfig() {
    const config = new Config();

    Object.keys(entry).forEach((key) => {
      const e = config.entry(key);
      api.pattern(entry[key]).forEach((f) => e.add(f));
    });

    config
      .mode(production ? 'production' : 'development')
      .context(ctx)
      .output.merge({
        filename: `[name].bundle.js`,
        publicPath,
        path: resolve(ctx, api.resolve(outputFolder)),
      });

    if (production) {
      config.optimization.set('moduleIds', 'hashed');
    } else {
      config.devtool('cheap-module-source-map');
    }

    return config;
  }

  function createCompiler(config = createConfig()) {
    const webpack = require('webpack');
    const chainCfg = $hooks.callWith('config:chain', config);

    const webpackCfg = $hooks.callWith('config', chainCfg.toConfig());

    return webpack(webpackCfg);
  }

  function compile(done) {
    const compiler = createCompiler();
    compiler.run((err, stats) => {
      $hooks.callWith('completed', stats);
      if (err || stats.hasErrors()) {
        done(err || 'Compilation Error');
        return;
      }
      done();
    });
  }

  return Object.assign(compile, {
    createCompiler,
    watch(done) {
      const compiler = createCompiler();
      let first = false;
      compiler.watch({}, (err, stats) => {
        $hooks.callWith('completed', stats);
        $hooks.callWith('completed:watch', stats);
        if (err) {
          logger.error(err);
        }
        if (!first) {
          first = true;
          done();
        }
      });
    },
    middleware({ stats = 'minimal', hot = false } = {}) {
      const config = createConfig();

      if (hot) {
        const { HotModuleReplacementPlugin } = require('webpack');
        config.plugin('hmr').use(HotModuleReplacementPlugin);
        config.entryPoints.store.forEach((entry) => {
          entry.add('webpack-hot-middleware/client');
        });
      }

      const compiler = createCompiler(config);

      compiler.hooks.done.tap('wp:gulp:done', (stats) => {
        $hooks.callWith('completed:middleware', stats);
      });

      const mws = [
        require('webpack-dev-middleware')(compiler, {
          publicPath,
          stats,
        }),
      ];

      if (hot) {
        mws.push(require('webpack-hot-middleware')(compiler));
      }

      return mws;
    },
    asServerMiddleware(server, options = {}) {
      server.tap('middlewares', 'webpack', (middlewares, env) => {
        if (env.production) {
          return middlewares;
        }

        if (options.hot !== true) {
          const reloader = server.reload();
          $hooks.tap('completed:middleware', 'reload', (stats) => {
            if (!stats.hasErrors()) {
              reloader();
            }
          });
        }

        const [dev, hmr] = this.middleware(options);
        middlewares.set('webpack-dev', dev);

        if (env.livereload !== false && options.hot) {
          middlewares.set('webpack-hmr', hmr);
        }

        return middlewares;
      });
    },
  });
};
