# Webpack Task

Sharable tasks for Webpack.

## Installation

This task requires `@wok-cli/core` and `webpack@^4.0.0` as peer dependency.

```
npm i @wok-cli/core webpack@^4.0.0 @wok-cli/task-scripts --save-dev
```

## Parameters

| parameter      | type   | default         | note                                            |
| -------------- | ------ | --------------- | ----------------------------------------------- |
| `entry`        | object |                 | Webpack [entry][1] configuration <sup>(1)</sup> |
| `outputFolder` | string |                 | Bundle [output folder][2] <sup>(1)</sup>        |
| `context`      | string | `process.cwd()` | Compiler [context folder][3]<sup>(1)</sup>      |

1. _Supports environment templates._

[1]: https://webpack.js.org/configuration/entry-context/#entry
[2]: https://webpack.js.org/configuration/output/#outputpath
[3]: https://webpack.js.org/configuration/entry-context/#context

## Hooks

| name                   | type               | description                                         |
| ---------------------- | ------------------ | --------------------------------------------------- |
| `config:chain`         | [webpack-chain][4] | The default webpack chain instance                  |
| `config`               | object             | The resolved webpack configuration object           |
| `completed`            | [stats][5]         | Run when a compilation ends (single and watch mode) |
| `completed:watch`      | [stats][5]         | Run when a compilation ends (watch mode only)       |
| `completed:middleware` | [stats][5]         | Run when a compilation ends (middleware mode only)  |

[4]: https://github.com/neutrinojs/webpack-chain
[5]: https://webpack.js.org/api/stats/

## Usage

By default the task will output sourcemaps in development. Each entry will be stored in the `outputFolder` with the following pattern: `[name].bundle.js`.

## Example

```js
const $ = require('@wok-cli/core');
const webpackTask = require('@wok-cli/task-webpack');

const webpack = task(webpackTask, {
  entry: { main: './src/main.js' },
  outputFolder: 'public',
});

exports.webpack = webpack;
```

By running the `gulp webpack` task, webpack will bundle `./src/main.js` and save it as `./public/main.bundle.js`.

## Watching for changes

The returned task has a `watch` sub-task that triggers the webpack watcher instead of a single compilation.

```js
const $ = require('@wok-cli/core');
const serveTask = require('@wok-cli/task-serve');
const webpackTask = require('@wok-cli/task-webpack');

const webpack = task(webpackTask, {
  entry: { main: './src/main.js' },
  outputFolder: 'public',
});

// watch and compile files
exports.watch = webpack.watch;
```

### Reloading the page

To reload the page after each successful compilation you can leverage the `completed:watch` hook. For example here is how you can trigger a reload with the `@wok-cli/server` task:

```js
const $ = require('@wok-cli/core');
const serveTask = require('@wok-cli/task-serve');
const webpackTask = require('@wok-cli/task-webpack');

const webpack = task(webpackTask, {
  entry: { main: './src/main.js' },
  outputFolder: 'public',
});

const serve = $.task(serveTask, {
  baseDir: ['public'],
});

const reload = serve.reload();

webpack.tap('complete:watch', 'reload', (stats) => {
  if (!stats.hasErrors()) {
    reload();
  }
  return stats;
});

export.serve = $.series(serve, webpack.watch)
```

Running `gulp serve` will run a local server watching for file changes and reloading the page after each compilation.

## Usage with `webpack-dev-middleware`

[`webpack-dev-middleware`](https://github.com/webpack/webpack-dev-middleware) lets you run the compiler process as an Express middleware.

This can save

## Usage with [`gulp-babel`](https://www.npmjs.com/package/gulp-babel)

```js
const $ = require('@wok-cli/core');
const scripts = require('@wok-cli/task-scripts');
const babel = require('gulp-babel');

const scriptsTask = $.task(scripts, {
  src: ['src/assets/js/**/*.js'],
  dest: 'public/assets/js',
});

scriptsTask.tap('transform', 'babel', (lazypipe) => {
  return lazypipe.pipe(babel, {
    // babel configuration here...
  });
});

exports.scripts = scriptsTask;
```
