# Serve Task

Node.js server as a sharable task

This task uses [BrowserSync](https://www.browsersync.io/)

<!-- TOC -->

- [Installation](#installation)
- [Environmental variables](#environmental-variables)
- [Parameters](#parameters)
- [Hooks](#hooks)
- [Example](#example)
  - [Adding middlewares](#adding-middlewares)
  - [Modifying the configuration](#modifying-the-configuration)
- [Live Reload](#live-reload)
  - [Full page reload](#full-page-reload)
  - [Content injection](#content-injection)

<!-- /TOC -->

## Installation

```
npm i @wok-cli/task-serve --save-dev
```

## Environmental variables

This task adds the following [environmental variables](packages/core/configuration#env):

- `livereload`: (boolean) Set to `false` to disable live reloading.
- `devServer`: (object) BrowserSync server options. Currently it just supports the `port` property (defaults to `8000`).

## Parameters

| parameter  | type               | default      | note                                       |
| ---------- | ------------------ | ------------ | ------------------------------------------ |
| `baseDir`  | string<br>string[] | `['public']` | Directories to [serve][1]                  |
| `hook:(*)` | object             |              | Hooks configuration parameters (see below) |

1. Supports environment templates.

[1]: https://www.browsersync.io/docs/options#option-server

## Hooks

| name          | type       | description                                                                                   |
| ------------- | ---------- | --------------------------------------------------------------------------------------------- |
| `middlewares` | [Map][1]   | A map of BroserSync middlewares <sup>(1)</sup>                                                |
| `config`      | object     | BroserSync [options object][3]                                                                |
| `running`     | brosersync | Executed after the server has started. Receives the brosersync server instance as accumulator |

1. By default implements the [compression](https://www.npmjs.com/package/compression) middleware in production

[1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
[2]: https://www.browsersync.io/docs/options#option-middleware
[3]: https://www.browsersync.io/docs/options

## Example

```js
const $ = require('@wok-cli/core');
const serve = require('@wok-cli/task-serve');

exports.serve = $.task(serve, {
  baseDir: ['public'],
});
```

### Adding middlewares

```js
const $ = require('@wok-cli/core');
const serve = require('@wok-cli/task-serve');

const serve = $.task(serve, {
  baseDir: ['public'],
});

serve.tap('middlewares', 'myMiddleware', (middlewares) => {
  function myMiddleware(req, res, next) {
    // handle request or call next()
  }
  return middlewares.set('myMiddleware', myMiddleware);
});

exports.serve = serve;
```

### Modifying the configuration

The following example disables the [`open`](https://www.browsersync.io/docs/options#option-open) option on the BrowserSync instance.

```js
const $ = require('@wok-cli/core');
const serve = require('@wok-cli/task-serve');

const serve = $.task(serve, {
  baseDir: ['public'],
});

serve.tap('config', 'noOpen', (config) => {
  return {
    ...config,
    open: false,
  };
});

exports.serve = serve;
```

## Live Reload

The task exposes two utility methods to generate live reload gulp tasks:

### Full page reload

```js
const $ = require('@wok-cli/core');
const serve = require('@wok-cli/task-serve');

// ...

const serve = $.task(serve, {
  baseDir: ['public'],
});

const reload = serve.reload();

// watch scripts, run associated tasks and reload the page
exports.watch = $.watch('src/*.js', $.series(scripts, reload));
```

The method accepts the same arguments of BrowserSync's [`.reload()`](https://www.browsersync.io/docs/api#api-reload) method

### Content injection

This method will try to inject the changed files instead of perform a full page reload.
The technique is useful, for example, to live reload CSS files.

```js
const $ = require('@wok-cli/core');
const serve = require('@wok-cli/task-serve');

// ...

const serve = $.task(serve, {
  baseDir: ['public'],
});

const stream = serve.stream({ match: '**/*.css' });

// watch Sass files, run associated tasks and inject the new CSS
exports.watch = $.watch('src/*.scss', $.series(styles, stream));
```

The method accepts the same arguments of BrowserSync's [`.stream()`](https://www.browsersync.io/docs/api#api-stream) method.
