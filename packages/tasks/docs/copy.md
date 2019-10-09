# Copy Task

The `copy` task can be used to copy a set of files from one location to another.

By default this task won't apply any transformation to the files.

To maximize the task performances it will copy just those files that have changed since the task latest execution.

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
| `process`  | [lazypipe][2] | Executed before writing each file onto the destination folder |
| `complete` | [lazypipe][2] | Executed after each file has been copied                      |

[2]: https://github.com/OverZealous/lazypipe

## Example

```js
const $ = require('@wok-cli/core');
const { copy } = require('@wok-cli/tasks');

exports.copy = $.task(copy, {
  src: ['static/**'],
  dest: 'dist',
});
```
