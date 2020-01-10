const { task, series } = require('@wok-cli/core');
const serveTask = require('@wok-cli/task-serve');
const webpackTask = require('@wok-cli/task-webpack');
const cpyTask = require('./tasks/copy');
const DEST = 'public';

const server = task(serveTask, {
  baseDir: [DEST],
});

const webpack = task(webpackTask, {
  entry: { main: './src/main.js' },
  outputFolder: DEST,
});

webpack.tap('config:chain', 'babel', (config) => {
  config.module
    .rule('js')
    .test(/\.m?js$/)
    .use('babel')
    .loader('babel-loader');
  return config;
});

const copy = task(cpyTask, {
  src: 'src/index.html',
  dest: DEST,
});

webpack.asServeMiddleware(server, { hot: true });

// server.tap('middlewares', 'webpack', (
//   middlewares /*, env, api, params, bs*/,
// ) => {
//   const mw = webpack.middleware({ hot: true });
//   middlewares.set('webpack-dev', mw);
//   middlewares.set('webpack-reload', mw.hmr);
//   // middlewares.set(
//   //   'webpack-dev',
//   //   webpack.middleware({
//   //     done(stats) {
//   //       if (stats.hasErrors()) {
//   //         return;
//   //       }
//   //       bs.reload();
//   //     },
//   //   }),
//   // );
//   return middlewares;
// });

exports.default = series(copy, webpack);

exports.serve = series(copy, server);
