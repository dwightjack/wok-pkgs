# Scripts Task

Sharable tasks for CSS stylesheets.

By default the task implements [gulp-postcss](https://github.com/postcss/gulp-postcss), [autoprefixer](https://github.com/postcss/autoprefixer) and [cssnano](https://cssnano.co/) (production only) copies scripts from source to destination. Use one of the [hooks](#hooks) to transform the source code.

## Installation

```
npm i @wok-cli/task-scripts --save-dev
```

## Parameters

| parameter    | type               | default | note                                        |
| ------------ | ------------------ | ------- | ------------------------------------------- |
| `src`        | string<br>string[] |         | [Globs][1] source files <sup>(1)</sup>      |
| `dest`       | string             |         | Destination folder <sup>(1)</sup>           |
| `sourcemaps` | string<br>boolean  | `'.'`   | Write sourcemaps. See [here][2] for details |
| `hook:(*)`   | object             |         | Hooks configuration parameters (see below)  |

1. Supports environment templates.

[1]: https://gulpjs.com/docs/en/api/concepts#globs
[2]: https://gulpjs.com/docs/en/api/src#sourcemaps

## Hooks

| name       | type          | description                                          |
| ---------- | ------------- | ---------------------------------------------------- |
| `pre`      | [lazypipe][1] | execute pre-processing hooks                         |
| `pre`      | [lazypipe][1] | execute post-processing hooks (by default `postcss`) |
| `complete` | [lazypipe][1] | executed after styles have been copied               |

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
