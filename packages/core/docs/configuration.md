# Configuration Object

A Wok configuration object includes methods and properties used to setup Wok tasks and manage their workflow.

<!-- TOC -->

- [Usage](#usage)
- [Exposed APIs](#exposed-apis)
  - [Inherited Functions](#inherited-functions)
  - [`$.task`](#task)
    - [Example](#example)
  - [`$.watcher`](#watcher)
    - [Example](#example-1)
    - [Watcher Hook](#watcher-hook)
  - [`$.env`](#env)
  - [`$.api`](#api)
    - [`src()` and `dest()`](#src-and-dest)
    - [`GlobalHooks`](#globalhooks)
    - [`resolve(string)`](#resolvestring)
    - [`pattern(string|string[])`](#patternstringstring)
- [Extend or Overwrite `$.env` Variables](#extend-or-overwrite-env-variables)
  - [Local Configuration File](#local-configuration-file)
  - [Merge Order](#merge-order)

<!-- /TOC -->

## Usage

To load the default configuration object require it from `@wok-cli/core`:

```js
// gulpfile.js
const $ = require('@wok-cli/core');
```

?> **Note**: as a convention we use `$` as the configuration constant name. Feel free to use any name you prefer.

## Exposed APIs

- [Inherited Functions](#inherited-functions)
- [`$.task`](#task)
- [`$.watcher`](#watcher)
- [`$.env`](#env)
- [`$.api`](#api)

### Inherited Functions

The Wok configuration object inherits and exposes the following functions from gulp:

- [\$.series](https://gulpjs.com/docs/en/api/series)
- [\$.parallel](https://gulpjs.com/docs/en/api/parallel)
- [\$.watch](https://gulpjs.com/docs/en/api/watch)

### `$.task`

An utility function to setup sharable Wok tasks. It will return a gulp-ready task ready to be exposed from your gulpfile.

Accepts the following arguments:

| name   | type     | description                                  |
| ------ | -------- | -------------------------------------------- |
| task   | function | A sharable Wok task function                 |
| params | object   | (optional) The task configuration parameters |

#### Example

```js
//tasks/copy.js

module.exports = function(gulp, params) {
  return function copy() {
    gulp.src(params.src).pipe(gulp.dest(params.dest));
  };
};
```

```js
// gulpfile.js

const gulp = require('gulp');
const $ = require('@wok-cli/core');
const copy = require('./tasks/copy.js');

exports.copy = $.task(copy, {
  src: 'src/**',
  dest: 'public',
});
```

?> Learn more about sharable tasks in the [dedicated guide](packages/core/create-tasks)

### `$.watcher`

An utility method to create a gulp watcher. Accepts the following arguments:

| name              | type     | description                                                      |
| ----------------- | -------- | ---------------------------------------------------------------- |
| params            | object   |                                                                  |
| - params.task     | function | Task function (see [`$.task`][#task])                            |
| - params.id       | string   | (optional) Watcher id. Defaults to the task function name        |
| - params.patterns | string[] | Glob patterns to watch                                           |
| watchOptions      | object   | (optional) `gulp.watch` [options][1]. Defauts to `{ delay: 50 }` |

[1]: https://gulpjs.com/docs/en/api/watch#options

The function will returns a gulp [watcher instance](https://gulpjs.com/docs/en/api/watch#returns).

#### Example

The following example will setup a watch task listening on the `src` folder and running `copyTask` on change.

```js
const { copy } = require('@wok-cli/core/tasks');

const copyTask = $.task(copy, {
  src: 'src/**',
  dest: 'public',
});

exports.watch = (done) => {
  $.watcher({ task: copyTask, patterns: 'src/**' });
  done();
};

exports.copy = copyTask;
```

#### Watcher Hook

The generated watcher will run a global `watcher` hook when the task has completed.

The `watcher` hook is called with the following arguments:

| name         | type    | description                               |
| ------------ | ------- | ----------------------------------------- |
| accumulator  | Promise | A resolved promise                        |
| `$.env`      | object  | See [below](#env)                         |
| `$.api`      | object  | See [below](#api)                         |
| watchOptions | object  | The watcher options passed to `$.watcher` |
| taskName     | string  | The name of the task passed to `$watcher` |

To tap into the hook use the `$.api.globalHooks` instance.

?> Learn more about Wok hooks in the [Hooks Guide](packages/core/hooks).

### `$.env`

`env` exposes a composed APIs including configuration and environmental variables.

| property   | type    | description                                                                                                   |
| ---------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| publicPath | string  | base path for all URLs within your application. Defaults to `'/'`<sup>(1)</sup>                               |
| production | boolean | will be true if the `--production` CLI flag is set                                                            |
| command    | string  | the value of the `--command` CLI option                                                                       |
| target     | string  | the value of the `--target` CLI option. Defaults to `development` or to `production` if `--production` is set |
| pkg        | object  | `package.json` as an object                                                                                   |
| argv       | object  | CLI arguments parsed by [yargs](https://github.com/yargs/yargs/blob/master/docs/.md#argv)                     |
| buildHash  | string  | An unique hash for each execution. Can be used for logging                                                    |

### `$.api`

The Wok configuration public API. Includes the following functions and objects:

#### `src()` and `dest()`

[src](https://gulpjs.com/docs/en/api/src) and [dest](https://gulpjs.com/docs/en/api/dest) from the gulp public API.

#### `GlobalHooks`

A global [`Hooks`](packages/core/hooks) instance.

#### `resolve(string)`

A function receiving a [lodash templates](https://lodash.com/docs/4.17.11#template) and interpolates it in the context of `$.env`.

```js
// $.env.target === 'development'

$.api.resolve('The target is: <%= target %>') === 'The target is: development';
```

#### `pattern(string|string[])`

The same as `resolve` but accepts also an array of strings.

Always returns an array of strings

```js
// $.env.target === 'development'

$.api.pattern('<%= target %>') === ['development'];
```

## Extend or Overwrite `$.env` Variables

There are two methods to add or overwrite the properties in `$.env` (except for `argv` and `pkg`):

1. Create a `wok.config.js` configuration file in the project root folder. Wok will read the file contents and merge into `$.env`.

```js
// wok.config.js
module.exports = {
  production: true,
};
```

2. Generate a custom configuration object:

```js
// gulpfile.js
const gulp = require('gulp');
const createConfig = require('@wok-cli/core/config');

// force production to `true` regardless of the value of `--production`
const $ = createConfig(gulp, {
  production: true,
});
```

### Local Configuration File

The first method lets you specify configuration options in a dedicated file. A benefit of this method is that it allows you to create a local configuration file `wok.config.local.js`) with setups just for your local environment. Just add it to your `.gitignore` file to prevent it to be shared with other developers or pushed to CI servers.

The local configuration file can expose either an object, in which case the local and project configurations will be merged, or a function receiving the project's configuration as first argument.

```js
// wok.config.local.js

module.exports = (cfg) => {
  if (cfg.production === true) {
    // do something on production
    return {
      // ...
    };
  }
  return cfg;
};
```

### Merge Order

The order in which custom environment properties will be merged is:

- `wok.config.js` properties
- `wok.config.local.js` properties
- `createConfig` function parameters
