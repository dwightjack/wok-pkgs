# Scripts Task <sub>1.0.0<sub>

Sharable tasks for scripts.

By default the task just copies scripts from source to destination. Use one of the [hooks](#hooks) to transform the source code.

## Installation

This task requires `@wok-cli/core` as peer dependency.

```
npm i @wok-cli/core @wok-cli/task-scripts --save-dev
```

## Parameters

| parameter    | type               | default | note                                                      |
| ------------ | ------------------ | ------- | --------------------------------------------------------- |
| `src`        | string<br>string[] |         | [Globs][1] source files <sup>(1)</sup>                    |
| `dest`       | string             |         | Destination folder <sup>(1)</sup>                         |
| `sourcemaps` | string<br>boolean  |         | Write sourcemaps. See [here][2] for details<sup>(2)</sup> |
| `hook:(*)`   | object             |         | Hooks configuration parameters (see below)                |

1. _Supports environment templates._
2. _Defaults to the value of `$.env.sourcemaps`._

[1]: https://gulpjs.com/docs/en/api/concepts#globs
[2]: https://gulpjs.com/docs/en/api/src#sourcemaps

## Hooks

| name        | type          | description                                                                         |
| ----------- | ------------- | ----------------------------------------------------------------------------------- |
| `pre`       | [lazypipe][1] | Executed before `transform` hook                                                    |
| `transform` | [lazypipe][1] | Use this hook to transform source code with tools like [Babel](https://babeljs.io/) |
| `post`      | [lazypipe][1] | Executed just before writing the file to disk                                       |

[1]: https://github.com/OverZealous/lazypipe

## Example

```js
const $ = require('@wok-cli/core');
const scripts = require('@wok-cli/task-scripts');

exports.scripts = $.task(scripts, {
  src: ['src/assets/js/**/*.js'],
  dest: 'public/assets/js',
});
```

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
  return lazypipe.pipe(
    babel,
    {
      // babel configuration here...
    },
  );
});

exports.scripts = scriptsTask;
```
