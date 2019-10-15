# Styles Task

Sharable tasks for CSS stylesheets.

By default the task implements [gulp-postcss](https://github.com/postcss/gulp-postcss), [autoprefixer](https://github.com/postcss/autoprefixer) and [cssnano](https://cssnano.co/) (production only).

## Installation

This task requires `@wok-cli/core` as peer dependency.

```
npm i @wok-cli/core @wok-cli/task-styles --save-dev
```

## Parameters

| parameter    | type               | default | note                                                      |
| ------------ | ------------------ | ------- | --------------------------------------------------------- |
| `src`        | string<br>string[] |         | [Globs][1] source files <sup>(1)</sup>                    |
| `dest`       | string             |         | Destination folder <sup>(1)</sup>                         |
| `sourcemaps` | string<br>boolean  |         | Write sourcemaps. See [here][2] for details<sup>(2)</sup> |
| `hook:(*)`   | object             |         | Hooks configuration parameters (see below)                |

1. _Supports environment templates._
2. _Defaults to the value of `env.sourcemaps`._

[1]: https://gulpjs.com/docs/en/api/concepts#globs
[2]: https://gulpjs.com/docs/en/api/src#sourcemaps

## Hooks

| name       | type          | description                                          |
| ---------- | ------------- | ---------------------------------------------------- |
| `pre`      | [lazypipe][1] | Execute pre-processing hooks                         |
| `post`     | [lazypipe][1] | Execute post-processing hooks (by default `postcss`) |
| `complete` | [lazypipe][1] | Executed after styles have been copied               |

[1]: https://github.com/OverZealous/lazypipe

## Example

```js
const $ = require('@wok-cli/core');
const styles = require('@wok-cli/task-styles');

exports.styles = $.task(styles, {
  src: ['src/assets/css/**/*.css'],
  dest: 'public/assets/css',
});
```

## Configuring PostCSS plugins

To configure your own PostCSS plugins you may either pass them as the `hooks:post[postcss]` parameter or via a dedicated config file in your project root.

Both methods will override any built-in plugin defined by the task (ie: autoprefixer and cssnano).

### Via parameter

```diff
const $ = require('@wok-cli/core');
const styles = require('@wok-cli/task-styles');

exports.styles = $.task(styles, {
  src: ['src/assets/css/**/*.css'],
  dest: 'public/assets/css',
+ 'hooks:post': {
+   postcss: [
+     // ...plugins list
+   ],
+ },
});
```

### Via Dedicated Config

First of all you need to disable all built-in plugins by setting the plugins parameter to an empty array

```diff
const $ = require('@wok-cli/core');
const styles = require('@wok-cli/task-styles');

exports.styles = $.task(styles, {
  src: ['src/assets/css/**/*.css'],
  dest: 'public/assets/css',
+ 'hooks:post': {
+   postcss: [],
+ },
});
```

Then create a configuration file in project root folder. See [postcss-load-config](https://www.npmjs.com/package/postcss-load-config) for available formats.
