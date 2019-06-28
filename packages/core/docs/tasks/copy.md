# Copy Task

The `copy` task can be used to copy set of files from one location to another.

By default this task won't apply any transformation to the file.

To maximize the task performances just those files that have changed since the task latest execution will be copied.

## Parameters

| parameter  | type               | note                                       |
| ---------- | ------------------ | ------------------------------------------ |
| `src`      | string<br>string[] | [Globs][1] source files <sup>(1)</sup>     |
| `dest`     | string             | Destination folder <sup>(1)</sup>          |
| `hook:(*)` | object             | Hooks configuration parameters (see below) |

1. Supports environment templates.

[1]: https://gulpjs.com/docs/en/api/concepts#globs

## Hooks

| name       | type          | description                                                   |
| ---------- | ------------- | ------------------------------------------------------------- |
| `process`  | [lazypipe][2] | executed before writing each file onto the destination folder |
| `complete` | [lazypipe][2] | executed after each file has been copied                      |

[2]: https://github.com/OverZealous/lazypipe

## Example

```js
const gulp = require('gulp');
const config = require('@wok-cli/core');
const { copy } = require('@wok-cli/core/tasks');

const $ = config(gulp);

exports.copy = $.task(copy, {
  src: ['static/**'],
  dest: 'dist',
});
```
