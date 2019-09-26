# Rev Task

Sharable tasks to apply a unique hash to file names. Implements the following gulp plugins:

- [gulp-rev](https://www.npmjs.com/package/gulp-rev)
- [gulp-rev-delete-original](https://www.npmjs.com/package/gulp-rev-delete-original)
- [gulp-rev-rewrite](https://www.npmjs.com/package/gulp-rev-rewrite)

**Note** This task will be applied just on production.

## Installation

```
npm i @wok-cli/task-rev --save-dev
```

## Environmental variables

This task adds the following [environmental variables](packages/core/configuration#env):

- `rev`: (boolean) Set to `false` to skip execution.

## Parameters

| parameter  | type               | default | note                                              |
| ---------- | ------------------ | ------- | ------------------------------------------------- |
| `pattern`  | string<br>string[] |         | [Globs][1] source files to rewrite <sup>(1)</sup> |
| `dest`     | string             |         | Destination folder <sup>(1)</sup>                 |
| `manifest` | string             |         | Manifest file path <sup>(1)</sup>                 |
| `hook:(*)` | object             |         | Hooks configuration parameters (see below)        |

1. Supports environment templates.

[1]: https://gulpjs.com/docs/en/api/concepts#globs

## Hooks

| name      | type          | description                                                             |
| --------- | ------------- | ----------------------------------------------------------------------- |
| `before`  | [lazypipe][1] | executed before file revving                                            |
| `after`   | [lazypipe][1] | executed after file revving (source files have been deleted)            |
| `rewrite` | [lazypipe][1] | executed before revved source files is updated by [gulp-rev-rewrite][2] |

[1]: https://github.com/OverZealous/lazypipe
[2]: https://www.npmjs.com/package/gulp-rev-rewrite

## Example

```js
const $ = require('@wok-cli/core');
const rev = require('@wok-cli/task-rev');

exports.rev = $.task(rev, {
  pattern: ['public/**/*.{js,css}'],
  dest: 'public',
  manifest: 'public/manifest.json',
});
```
