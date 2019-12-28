const { task, series } = require('@wok-cli/core');
const serveTask = require('@wok-cli/task-serve');
const webpackTask = require('./tasks/webpack');
const DEST = 'public';

function cpyTask(gulp, { src }) {
  return function copy() {
    return gulp.src(src).pipe(gulp.dest(DEST));
  };
}

const server = task(serveTask, {
  baseDir: [DEST],
});

const webpack = task(webpackTask, {
  entry: { main: './src/main.js' },
  outputFolder: DEST,
});

// serve.tap('middlewares', 'myMiddleware', (middlewares) => {
//   function myMiddleware(req, res, next) {
//     // handle request or call next()
//   }
//   return middlewares.set('myMiddleware', myMiddleware);
// });

const copy = task(cpyTask, {
  src: 'src/index.html',
});

server.tap('middlewares', 'webpack', (middlewares) => {
  return middlewares.set('webpack-dev', webpack.middleware());
});

exports.default = series(copy, webpack);

exports.serve = series(copy, server);
