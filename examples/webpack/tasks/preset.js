const { createPreset } = require('@wok-cli/core/preset');

module.exports = function myPreset($) {
  const serveTask = require('@wok-cli/task-serve');
  const webpackTask = require('./webpack');
  const cpyTask = require('./copy');
  const preset = createPreset($);
  const DEST = 'public';

  preset
    .set('copy', cpyTask, {
      src: 'src/index.html',
      dest: DEST,
    })
    .set('webpack', webpackTask, {
      entry: { main: './src/main.js' },
      outputFolder: DEST,
    })
    .set('server', serveTask, { baseDir: [DEST] })
    .default(({ copy, webpack }) => {
      return $.series(copy, webpack);
    })
    .set('serve')
    .compose(({ copy, webpack, server }) => {
      server.tap(
        'middlewares',
        'webpack',
        (middlewares, env, api, params, bs) => {
          return middlewares.set(
            'webpack-dev',
            webpack.middleware({
              done(stats) {
                if (stats.hasErrors()) {
                  return;
                }
                bs.reload();
              },
            }),
          );
        },
      );
      return $.series(copy, server);
    });

  return preset;
};
