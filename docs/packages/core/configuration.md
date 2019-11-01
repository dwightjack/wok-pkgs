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
  - [Examples](#examples)
  - [Custom config module name and base location](#custom-config-module-name-and-base-location)
  - [Dynamic configuration](#dynamic-configuration)
  - [Local Configuration File](#local-configuration-file)

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

- [`$.series`](https://gulpjs.com/docs/en/api/series)
- [`$.parallel`](https://gulpjs.com/docs/en/api/parallel)
- [`$.watch`](https://gulpjs.com/docs/en/api/watch)

### `$.task`

A utility function to setup sharable Wok tasks. It will return a gulp-ready task ready to be exposed from your gulpfile.

Accepts the following arguments:

| name   | type     | description                                  |
| ------ | -------- | -------------------------------------------- |
| task   | function | A sharable Wok task function                 |
| params | object   | (optional) The task configuration parameters |

#### Example

Let's create a sharable `copy` task function with configurable source and destination folders.

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

A utility method to create a gulp watcher. Accepts the following arguments:

| name              | type     | description                                                      |
| ----------------- | -------- | ---------------------------------------------------------------- |
| params            | object   |                                                                  |
| - params.task     | function | Task function (see [`$.task`](#task))                            |
| - params.id       | string   | (optional) Watcher id. Defaults to the task function name        |
| - params.patterns | string[] | Glob patterns to watch                                           |
| watchOptions      | object   | (optional) `gulp.watch` [options][1]. Defauts to `{ delay: 50 }` |

[1]: https://gulpjs.com/docs/en/api/watch#options

The function will returns a gulp [watcher instance](https://gulpjs.com/docs/en/api/watch#returns).

#### Example

The following example will setup a watch task listening on the `src` folder and running the previously defined `copy` task on change.

```js
const copy = require('./tasks/copy.js');

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

| name         | type    | description                                |
| ------------ | ------- | ------------------------------------------ |
| accumulator  | Promise | A resolved promise                         |
| `$.env`      | object  | See [below](#env)                          |
| `$.api`      | object  | See [below](#api)                          |
| watchOptions | object  | The watcher options passed to `$.watcher`  |
| taskName     | string  | The name of the task passed to `$.watcher` |

To tap into the hook use the `$.api.globalHooks` instance.

?> Learn more about Wok hooks in the [Hooks Guide](packages/core/hooks).

### `$.env`

`env` exposes a composed APIs including configuration and environmental variables.

Task and plugins can add custom configuration variables. By default Wok exposes the following properties:

| property   | type              | description                                                        |
| ---------- | ----------------- | ------------------------------------------------------------------ |
| publicPath | string            | Base path for all URLs within your application. Defaults to `'/'`. |
| production | boolean           | `true` for production builds. Defaults to `false`.                 |
| target     | string            | The value of the [`--target`][2] CLI option. <sup>(1)</sup>        |
| pkg        | object            | The project's `package.json` as an object                          |
| argv       | object            | CLI arguments parsed by [yargs][3]                                 |
| buildHash  | string            | A unique hash for each execution. Can be used for logging.         |
| sourcemaps | boolean<br>string | Generate sourcemaps. <sup>(2)</sup>                                |

1. _Defaults to `development`. If `--production` is set, defaults to `production`._
1. _By default generates external sourcemaps in the same folder of the source file. Set to `true` to generate inline sourcemaps or to `false` to disable this feature._

[2]: /packages/core/cli?id=deploy-targets
[3]: https://github.com/yargs/yargs/blob/master/docs/.md#argv

### `$.api`

The Wok configuration public API. Includes the following functions and objects:

#### `src()` and `dest()`

[src](https://gulpjs.com/docs/en/api/src) and [dest](https://gulpjs.com/docs/en/api/dest) from the gulp public API.

#### `GlobalHooks`

A global [`Hooks`](packages/core/hooks) instance.

#### `resolve(string)`

A function that receives a [lodash templates](https://lodash.com/docs/4.17.11#template) and interpolates it in the context of `$.env`.

```js
// $.env.target === 'development'

$.api.resolve('The target is: <%= target %>') === 'The target is: development';
```

#### `pattern(string|string[])`

The same as `resolve` but accepts also an array of strings.

Always returns an array of strings.

```js
// $.env.target === 'development'

$.api.pattern('<%= target %>') === ['development'];
```

## Extend or Overwrite `$.env` Variables

You can overwrite the properties in `$.env` (except for `argv` and `pkg`) by creating a configuration file in the project root folder or adding a `wok` property to your `package.json` file. Wok will read the file contents and merge them into `$.env`. A Wok configuration filename must follow the [cosmiconfig](https://github.com/davidtheclark/cosmiconfig#cosmiconfig) configuration standard.

### Examples

As a JavaScript file in the project root folder:

```js
// wok.config.js
module.exports = {
  production: true,
};
```

As a property in you project's `package.json`.

```json
{
  "name": "my-project",
  "dependencies": {
    //...
  },
  // ...
  "wok": {
    "production": true
  }
}
```

### Custom config module name and base location

You can customize the config resolution method by generating a custom configuration object passing both a module name and the base folder where to search for the configuration files.

In the following example, we tell Wok to search for config files named `mywok` (like `.mywokrc.json` or `mywok.config.js`) starting from the `/path/to-the/project/` folder.

```js
// gulpfile.js
const gulp = require('gulp');
const createConfig = require('@wok-cli/core/config');

const $ = createConfig(gulp, {
  configName: 'mywok',
  cwd: '/path/to-the/project/',
});
```

### Dynamic configuration

If you need to set the configuration dynamically (for example based on the value of the `production` key), you can do so by using the `wok.config.js` file format and export a function instead of an object. The function receives the default computed `$.env` and must return the updated object:

```js
// wok.config.js
module.exports = (env) => {
  return {
    ...env,
    publicPath: env.production ? '/campaign/' : '/',
  };
};
```

### Local Configuration File

If you're using a configuration file like `wok.config.js` or `.wokrc.json`, you can also create a local configuration file with setups just for your local environment.

1. Alongside the main configuration file create a new one with the same name and append `.local` before the extension (for example `wok.config.js` -> `wok.config.local.js`).
1. Add the new file to your `.gitignore` to prevent it to be shared with other developers or pushed to CI servers.

As for the main configuration file, the `wok.config.local.js` file can export either an object (in which case the local and main configurations will be merged) or a function receiving the main configuration as its first argument.

```js
// wok.config.local.js

module.exports = (mainConfig) => {
  if (mainConfig.production === true) {
    // do something on production
    return {
      ...mainConfig,
      // ...
    };
  }
  return mainConfig;
};
```
