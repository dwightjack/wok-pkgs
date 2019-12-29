module.exports = function webpackTask(
  gulp,
  { entry = {}, outputFolder = '', context = process.cwd() },
  { production, publicPath },
  api,
) {
  const { resolve } = require('path');
  const Config = require('webpack-chain');
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
      .output.filename(`[name].bundle.js`)
      .publicPath(publicPath)
      .path(resolve(ctx, api.resolve(outputFolder)))
      .end()
      .module.rule('js')
      .test(/\.m?js$/)
      .use('babel')
      .loader('babel-loader');

    if (production) {
      config.optimization.moduleIds('hashed');
    } else {
      config.devtool('cheap-module-source-map');
    }

    return config;
  }

  function createCompiler() {
    const webpack = require('webpack');
    const chainCfg = $hooks.callWith('config:chain', createConfig());

    const webpackCfg = $hooks.callWith('config', chainCfg.toConfig());

    return webpack(webpackCfg);
  }

  function compile(done) {
    const compiler = createCompiler('normal');
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
    middleware({ stats = 'minimal', done: onDone } = {}) {
      const compiler = createCompiler();

      if (typeof onDone === 'function') {
        compiler.hooks.done.tap('wp:gulp:done', onDone);
      }
      return require('webpack-dev-middleware')(compiler, {
        publicPath,
        stats,
      });
    },
    watch(done) {
      const compiler = createCompiler();
      let first = false;
      compiler.watch({}, (err, stats) => {
        if (err || stats.hasErrors()) {
          console.error(err || stats.toString('normal'));
        } else {
          console.log(stats.toString('normal'));
        }
        if (!first) {
          first = true;
          done();
        }
      });
    },
  });
};
