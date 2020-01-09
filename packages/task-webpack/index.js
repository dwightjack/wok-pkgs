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
  const { noopMw, noop } = require('./lib/utils');
  const $hooks = this.getHooks();
  const ctx = api.resolve(context);

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
      if (err || stats.hasErrors()) {
        done(err || stats.toString('minimal'));
        return;
      }
      console.log(stats.toString('normal'));
      done();
    });
  }

  return Object.assign(compile, {
    createCompiler,
    watch(done) {
      const compiler = createCompiler();
      let first = false;
      compiler.watch({}, (err, stats) => {
        if (err || stats.hasErrors()) {
          logger.error(err || stats.toString('minimal'));
        } else {
          console.log(stats.toString('normal'));
        }
        if (!first) {
          first = true;
          done();
        }
      });
    },
    middleware({ stats = 'minimal', done: onDone, hot = false } = {}) {
      const config = createConfig();

      if (hot) {
        const { HotModuleReplacementPlugin } = require('webpack');
        config.plugin('hmr').use(HotModuleReplacementPlugin);
        config.entryPoints.store.forEach((entry) => {
          entry.add('webpack-hot-middleware/client');
        });
      }

      const compiler = createCompiler(config);

      if (typeof onDone === 'function') {
        compiler.hooks.done.tap('wp:gulp:done', onDone);
      }

      const mw = require('webpack-dev-middleware')(compiler, {
        publicPath,
        stats,
      });

      if (hot) {
        return Object.defineProperty(mw, 'hmr', {
          get() {
            return require('webpack-hot-middleware')(compiler);
          },
        });
      }

      return Object.defineProperty(mw, 'hmr', {
        value: noopMw,
      });
    },
    asServerMiddleware(server, options = {}) {
      server.tap(
        'middlewares',
        'webpack',
        (middlewares, env, api, params, bs) => {
          if (env.livereload !== false && options.hot !== true) {
            const { done = noop } = options;
            options.done = (stats) => {
              if (!stats.hasErrors()) {
                bs.reload();
              }
              done(stats);
            };
          }

          const mw = this.middleware(options);
          middlewares.set('webpack-dev', mw);

          if (env.livereload !== false && options.hot) {
            middlewares.set('webpack-hmr', mw.hmr);
          }

          return middlewares;
        },
      );
    },
  });
};
