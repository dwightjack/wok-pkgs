# Base Task

A generic purpose task. Use it as base for custom tasks.

## Parameters

| parameter  | type               | default | note                                       |
| ---------- | ------------------ | ------- | ------------------------------------------ |
| `src`      | string<br>string[] |         | [Globs][1] source files <sup>(1)</sup>     |
| `dest`     | string             |         | Destination folder <sup>(1)</sup>          |
| `name`     | string             |         | Final task name                            |
| `cache`    | boolean            | `false` | Run the task on changed files only         |
| `hook:(*)` | object             |         | Hooks configuration parameters (see below) |

_1. Supports environment templates._

[1]: https://gulpjs.com/docs/en/api/concepts#globs

## Hooks

| name       | type          | description                                                   |
| ---------- | ------------- | ------------------------------------------------------------- |
| `process`  | [lazypipe][2] | executed before writing each file onto the destination folder |
| `complete` | [lazypipe][2] | executed after each file has been written                     |

[2]: https://github.com/OverZealous/lazypipe

## Example

Create a file concatenation task.

```js
const $ = require('@wok-cli/core');
const { base } = require('@wok-cli/tasks');
const concat = require('gulp-concat');

const concatTask = $.task(base, {
  src: ['src/js/*.js'],
  dest: 'dist',
  name: 'concat',
});

concatTask.tap('process', 'concat', (lazypipe) => lazypipe.pipe(concat));

exports.concat = concatTask;
```

## Task Creation Helper

To create reusable, pre-configured tasks from the `base` task, use the `createTask` function.

The function accepts the following arguments

| name     | type   | description                              |
| -------- | ------ | ---------------------------------------- |
| taskName | string | name of the task (required)              |
| defaults | object | default [parameters](#parameters) values |

The following example is the implementation of the [`copy`](/packages/tasks/copy) task, where, by default we enable source files caching.

```js
const { createTask } = require('@wok-cli/tasks');

module.exports = createTask('copy', { cache: true });
```
