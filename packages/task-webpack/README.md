# Webpack Task

Sharable tasks for Webpack.

<!-- TOC -->

- [Installation](#installation)
- [Parameters](#parameters)
- [Hooks](#hooks)
- [Usage](#usage)
- [Example](#example)
- [Watching for changes](#watching-for-changes)
  - [Reloading the page](#reloading-the-page)
- [Usage with `webpack-dev-middleware`](#usage-with-webpack-dev-middleware)
  - [Live Reload and Hot Module Replacement](#live-reload-and-hot-module-replacement)
  - [Shorthand signature](#shorthand-signature)
- [Babel integration](#babel-integration)

<!-- /TOC -->

## Installation

This task requires `@wok-cli/core` and `webpack@^4.0.0` as peer dependency.

```
npm i @wok-cli/core webpack@^4.0.0 @wok-cli/task-scripts --save-dev
```

## Parameters

| parameter      | type   | default         | note                                                |
| -------------- | ------ | --------------- | --------------------------------------------------- |
| `entry`        | object |                 | Webpack [entry][entry] configuration <sup>(1)</sup> |
| `outputFolder` | string |                 | Bundle [output folder][output] <sup>(1)</sup>       |
| `context`      | string | `process.cwd()` | Compiler [context folder][ctx]<sup>(1)</sup>        |

1. _Supports environment templates._

[entry]: https://webpack.js.org/configuration/entry-context/#entry
[output]: https://webpack.js.org/configuration/output/#outputpath
[ctx]: https://webpack.js.org/configuration/entry-context/#context

## Hooks

| name                   | type                   | description                                 |
| ---------------------- | ---------------------- | ------------------------------------------- |
| `config:chain`         | [webpack-chain][chain] | The default webpack chain instance          |
| `config`               | object                 | The resolved webpack configuration object   |
| `completed`            | [stats][stats]         | Run when compilation ends (single mode)     |
| `completed:watch`      | [stats][stats]         | Run when compilation ends (watch mode)      |
| `completed:middleware` | [stats][stats]         | Run when compilation ends (middleware mode) |

[chain]: https://github.com/neutrinojs/webpack-chain
[stats]: https://webpack.js.org/api/stats/

## Usage

By default, the task will output sourcemaps in development. Each entry will be stored in the `outputFolder` with the following pattern: `[name].bundle.js`.

## Example

```js
const $ = require('@wok-cli/core');
const webpackTask = require('@wok-cli/task-webpack');

const webpack = $.task(webpackTask, {
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

const webpack = $.task(webpackTask, {
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

const webpack = $.task(webpackTask, {
  entry: { main: './src/main.js' },
  outputFolder: 'public',
});

const serve = $.task(serveTask, {
  baseDir: ['public'],
});

const reload = serve.reload();

webpack.tap('completed:watch', 'reload', (stats) => {
  if (!stats.hasErrors()) {
    reload();
  }
  return stats;
});

export.serve = $.series(serve, webpack.watch)
```

Running `gulp serve` will run a local server watching for file changes and reloading the page after each compilation.

## Usage with `webpack-dev-middleware`

To setup a webpack development middleware, you can use the `middleware` method. This will return an instance of `webpack-dev-middleware` to be used in any express-like application.

For example here is an example implementation with the `@wok-cli/server` task that uses `webpack-dev-middleware` in development mode:

```js
const $ = require('@wok-cli/core');
const serveTask = require('@wok-cli/task-serve');
const webpackTask = require('@wok-cli/task-webpack');

const webpack = $.task(webpackTask, {
  entry: { main: './src/main.js' },
  outputFolder: 'public',
});

const serve = $.task(serveTask, {
  baseDir: ['public'],
});


server.tap('middlewares', 'webpack', (middlewares) => {
  if ($.env.production === false) {
    middlewares.set('webpack', webpack.middleware());
  }
  return middlewares;
});

export.serve = $.series(serve)
```

### Live Reload and Hot Module Replacement

The above configuration will serve the bundled application via `webpack-dev-middleware` but to see the changes you still need to refresh manually the page.

To automate the process you can again leverage the built-in reload task of `@wok-cli/task-serve` attaching a function to the `completed:middleware` hook:

```js
const $ = require('@wok-cli/core');
const serveTask = require('@wok-cli/task-serve');
const webpackTask = require('@wok-cli/task-webpack');

// ...

const reload = serve.reload();

webpack.tap('completed:middleware', 'reload', (stats) => {
  if (!stats.hasErrors()) {
    reload();
  }
  return stats;
});

server.tap('middlewares', 'webpack', (middlewares) => {
  if ($.env.production === false) {
    middlewares.set('webpack', webpack.middleware());
  }
  return middlewares;
});

export.serve = $.series(serve)
```

Another popular reload option is [Hot Module Replacement](https://webpack.js.org/concepts/hot-module-replacement/). You can enable it by passing an options object with `hot: true` to the `middleware` method:

```js
// ...

server.tap('middlewares', 'webpack', (middlewares) => {
  if ($.env.production === false) {
    middlewares.set('webpack', webpack.middleware({ hot: true }));
  }
  return middlewares;
});

export.serve = $.series(serve)
```

### Shorthand signature

For your convenience, the task exposes an utility method `asServeMiddleware` to quickly integrate it with `@wok-cli/task-serve`:

```js
// ...
const webpack = $.task(webpackTask, {
  entry: { main: './src/main.js' },
  outputFolder: 'public',
});

const serve = $.task(serveTask, {
  baseDir: ['public'],
});

// run `webpack-dev-middleware`
// and reload on changes
webpack.asServeMiddleware(serve);

// run `webpack-dev-middleware`
// and trigger HMR on changes
webpack.asServeMiddleware(serve, { hot: true });
```

## Babel integration

To setup [`babel-loader`](https://github.com/babel/babel-loader) use the `config:chain` hook:

```js
// ...
const webpack = $.task(webpackTask, {
  entry: { main: './src/main.js' },
  outputFolder: 'public',
});

webpack.tap('config:chain', 'babel', (config) => {
  config.module
    .rule('js')
    .test(/\.m?js$/)
    .use('babel')
    .loader('babel-loader');
  return config;
});
```
