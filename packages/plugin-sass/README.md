## Wok Sass Plugin

Sass pre-processing support plugin for Wok. Implements [gulp-sass](https://www.npmjs.com/package/gulp-sass).

| Hook types | Production only | Purpose         |
| ---------- | --------------- | --------------- |
| lazypipe   | no              | style rendering |

## Installation

This plugin requires `@wok-cli/core` and `node-sass` as peer dependencies.

```
npm i @wok-cli/core node-sass @wok-cli/plugin-sass --save-dev
```

## Parameters

Configuration path: `sass`.

| parameter      | type               | default            | note                         |
| -------------- | ------------------ | ------------------ | ---------------------------- |
| `includePaths` | string<br>string[] | `['node_modules']` | include paths <sup>(1)</sup> |
| `functions`    | function           | see below          | Sass [custom function][1]    |

1. node-sass [`includePaths`](https://github.com/sass/node-sass#includepaths) options enhanced with support for environment templates.

[1]: https://github.com/sass/node-sass#functions--v300---experimental

## Usage

This plugin can be used to provide Sass support to [@wok-cli/task-styles](#TODO).

```js
const $ = require('@wok-cli/core');
const styles = require('@wok-cli/task-styles');
const sass = require('@wok-cli/plugin-sass');

const styleTask = $.task(styles, {
  src: ['src/assets/css/**/*.scss'],
  dest: 'public/assets/css',
});

styleTask.tap('pre', 'sass', sass);

exports.styles = styleTask;
```

### Custom functions

By default the plugin provides the following [custom functions](https://github.com/sass/node-sass#functions--v300---experimental):

#### `build-env()`

Returns either `'production'` or `'development'` based on the [`production`](#TODO) Wok environment variable.

#### `target-env()`

Returns the current deploy target as defined by the `--target` CLI argument.

#### `map-to-JSON($map)`

Returns a JSON stringified version of a Sass map.

| parameter | type | default | note           |
| --------- | ---- | ------- | -------------- |
| `$map`    | map  |         | input Sass map |

#### `asset-url($path)`

Returns
