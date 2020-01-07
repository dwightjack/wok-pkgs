# Modernizr Task <sub>1.0.2<sub>

Sharable tasks implementing [gulp-modernizr](https://www.npmjs.com/package/gulp-modernizr). Parses provided source files and generates a custom build of Modernizr based on the detected features.

## Installation

This task requires `@wok-cli/core` as peer dependency.

```
npm i @wok-cli/core @wok-cli/task-modernizr --save-dev
```

## Parameters

| parameter  | type               | default          | note                                                                       |
| ---------- | ------------------ | ---------------- | -------------------------------------------------------------------------- |
| `src`      | string<br>string[] |                  | [Globs][1] source files to parse <sup>(1)</sup>                            |
| `dest`     | string             |                  | Build destination folder <sup>(1)</sup>                                    |
| `filename` | string             | `'modernizr.js'` | Generated file name                                                        |
| `hook:(*)` | object             |                  | Hooks configuration parameters (see below)                                 |
| `*`        |                    |                  | Any other parameter will be passed-through as [gulp-modernizr settings][2] |

1. _Supports environment templates._

[1]: https://gulpjs.com/docs/en/api/concepts#globs
[2]: https://www.npmjs.com/package/gulp-modernizr#settings

## Hooks

| name        | type          | description                                                |
| ----------- | ------------- | ---------------------------------------------------------- |
| `generated` | [lazypipe][3] | executed after the modernizr build file has been generated |

[3]: https://github.com/OverZealous/lazypipe

## Example

```js
const $ = require('@wok-cli/core');
const modernizr = require('@wok-cli/task-modernizr');

exports.modernizr = $.task(modernizr, {
  src: ['src/**/*.{js,css}'],
  dest: 'public/assets/',
});
```
