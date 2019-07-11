# Bump Task

Sharable tasks implementing [gulp-bump](https://www.npmjs.com/package/gulp-bump).

# Installation

```
npm i @wok-cli/task-bump --save-dev
```

## Parameters

| parameter | type               | default            | note                                   |
| --------- | ------------------ | ------------------ | -------------------------------------- |
| `src`     | string<br>string[] | `['package.json']` | [Globs][1] source files <sup>(1)</sup> |
| `dest`    | string             | `'.'`              | Destination folder <sup>(1)</sup>      |

1. Supports environment templates.

[1]: https://gulpjs.com/docs/en/api/concepts#globs

## Hooks

This task does not expose any hook

## Example

```js
const gulp = require('gulp');
const config = require('@wok-cli/core');
const bump = require('@wok-cli/task-bump');

const $ = config(gulp);

exports.bump = $.task(bump, {
  src: ['./package.json'],
});
```
