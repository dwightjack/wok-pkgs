const { task, series } = require('@wok-cli/core');
const serveTask = require('@wok-cli/task-serve');
const webpackTask = require('./tasks/webpack');
const cpyTask = require('./tasks/copy');
const DEST = 'public';

const server = task(serveTask, {
  baseDir: [DEST],
});

const webpack = task(webpackTask, {
  entry: { main: './src/main.js' },
  outputFolder: DEST,
});

const copy = task(cpyTask, {
  src: 'src/index.html',
  dest: DEST,
});

server.tap('middlewares', 'webpack', (
  middlewares /*, env, api, params, bs*/,
) => {
  const [dev, hmr] = webpack.middlewareHMR();
  middlewares.set('webpack-dev', dev);
  middlewares.set('webpack-hmr', hmr);
  return middlewares;
  // return middlewares.set(
  //   'webpack-dev',
  //   webpack.middleware({
  //     done(stats) {
  //       if (stats.hasErrors()) {
  //         return;
  //       }
  //       bs.reload();
  //     },
  //   }),
  // );
});

exports.default = series(copy, webpack);

exports.serve = series(copy, server);
