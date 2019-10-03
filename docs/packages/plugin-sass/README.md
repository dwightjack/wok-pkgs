## Wok Sass Plugin

Sass pre-processing support plugin for Wok. Implements [gulp-sass](https://www.npmjs.com/package/gulp-sass).

| Hook types | Production only | Purpose         |
| ---------- | --------------- | --------------- |
| lazypipe   | no              | style rendering |

<!-- TOC -->

- [Wok Sass Plugin](#wok-sass-plugin)
- [Installation](#installation)
- [Parameters](#parameters)
- [Usage](#usage)
  - [Custom functions](#custom-functions)
    - [`build-env()`](#build-env)
    - [`target-env()`](#target-env)
    - [`map-to-JSON($map)`](#map-to-jsonmap)
    - [`asset-url($path)`](#asset-urlpath)
    - [`image-width($path)`, `image-height($path)`](#image-widthpath-image-heightpath)
    - [`inline-image($path)`](#inline-imagepath)

<!-- /TOC -->

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
| `functions`    | function           | [see below][2]     | Sass [custom function][1]    |

1. node-sass [`includePaths`](https://github.com/sass/node-sass#includepaths) options enhanced with support for environment templates.

All other parameters will be used as node-sass [configuration options](https://github.com/sass/node-sass#options).

[1]: https://github.com/sass/node-sass#functions--v300---experimental
[2]: #custom-functions

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

You can extend Sass with [custom functions](https://github.com/sass/node-sass#functions--v300---experimental) with the `functions` parameter:

```diff
const $ = require('@wok-cli/core');
const styles = require('@wok-cli/task-styles');
const sass = require('@wok-cli/plugin-sass');

const styleTask = $.task(styles, {
  src: ['src/assets/css/**/*.scss'],
  dest: 'public/assets/css',
+ 'hooks:pre': {
+   sass: {
+     function(env, api) {
+       return {
+         // ...
+       };
+     },
+   },
+ },
});

styleTask.tap('pre', 'sass', sass);

exports.styles = styleTask;
```

The `functions` parameter receives the Wok [environment](#TODO) and [API](#TODO) objects and must return an object with functions. See the official node-sass [documentation](https://github.com/sass/node-sass#functions--v300---experimental) for details.

By default the plugin provides the following functions:

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

Prepends the [`publicPath`](#TODO) environmental variable to the passed in `$path` string

This function is useful when the public path of a project changes baed on the target.

#### `image-width($path)`, `image-height($path)`

Return respectively the width and height of an image in pixels. `$path` is relative to the current working directory.

#### `inline-image($path)`

Returns an [url()](<https://developer.mozilla.org/en-US/docs/Web/CSS/url()>) function containing inline image data. `$path` is relative to the current working directory.

Uses [datauri](https://www.npmjs.com/package/datauri) for all images except for SVGs that are encoded ([learn why](https://css-tricks.com/probably-dont-base64-svg/)).
