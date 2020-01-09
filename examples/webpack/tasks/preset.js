const { createPreset } = require('@wok-cli/core/preset');

module.exports = function myPreset($) {
  const serveTask = require('@wok-cli/task-serve');
  const webpackTask = require('@wok-cli/task-webpack');
  const cpyTask = require('./copy');
  const preset = createPreset($);
  const DEST = 'public';

  preset
    .set('copy', cpyTask, {
      src: 'src/index.html',
      dest: DEST,
    })
    .set('webpack')
    .task(webpackTask)
    .params({
      entry: { main: './src/main.js' },
      outputFolder: DEST,
    })
    .hook('config:chain', 'babel', (config) => {
      config.module
        .rule('js')
        .test(/\.m?js$/)
        .use('babel')
        .loader('babel-loader');
      return config;
    })
    .end()
    .set('server', serveTask, { baseDir: [DEST] })
    .default(({ copy, webpack }) => {
      return $.series(copy, webpack);
    })
    .set('serve')
    .compose(({ copy, webpack, server }) => {
      webpack.asServeMiddleware(server);

      return $.series(copy, server);
    });

  return preset;
};
