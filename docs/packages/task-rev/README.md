# Rev Task <sub>1.0.3<sub>

Sharable tasks to apply a unique hash to file names. Implements the following gulp plugins:

- [gulp-rev](https://www.npmjs.com/package/gulp-rev)
- [gulp-rev-delete-original](https://www.npmjs.com/package/gulp-rev-delete-original)
- [gulp-rev-rewrite](https://www.npmjs.com/package/gulp-rev-rewrite)

**Note** This task will be applied just on production.

## Installation

This task requires `@wok-cli/core` as peer dependency.

```
npm i @wok-cli/core @wok-cli/task-rev --save-dev
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

1. _Supports environment templates._

[1]: https://gulpjs.com/docs/en/api/concepts#globs

## Hooks

| name      | type          | description                                                              |
| --------- | ------------- | ------------------------------------------------------------------------ |
| `before`  | [lazypipe][2] | Executed before file revving                                             |
| `after`   | [lazypipe][2] | Executed after file revving (source files have been deleted)             |
| `rewrite` | [lazypipe][2] | Executed before revved source files are updated by [gulp-rev-rewrite][3] |

[2]: https://github.com/OverZealous/lazypipe
[3]: https://www.npmjs.com/package/gulp-rev-rewrite

## Example

This example task will perform the following actions:

1. match the files with the provided glob pattern
2. create a new file with a unique rev hash appended to it's name
3. remove the original files

```js
const $ = require('@wok-cli/core');
const rev = require('@wok-cli/task-rev');

exports.rev = $.task(rev, {
  pattern: ['public/**/*.{js,css}'],
  dest: 'public',
  manifest: 'public/manifest.json',
});
```
