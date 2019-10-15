# Modernizr Task <sub>1.0.0<sub>

Sharable tasks implementing [gulp-modernizr](https://www.npmjs.com/package/gulp-modernizr).

## Installation

```
npm i @wok-cli/task-modernizr --save-dev
```

## Parameters

| parameter  | type               | default          | note                                                               |
| ---------- | ------------------ | ---------------- | ------------------------------------------------------------------ |
| `src`      | string<br>string[] |                  | [Globs][1] source files to parse <sup>(1)</sup>                    |
| `dest`     | string             |                  | Destination folder <sup>(1)</sup>                                  |
| `filename` | string             | `'modernizr.js'` | Generated file name                                                |
| `hook:(*)` | object             |                  | Hooks configuration parameters (see below)                         |
| `*`        |                    |                  | Any other parameter will be passed to [gulp-modernizr settings][2] |

1. _Supports environment templates._

[1]: https://gulpjs.com/docs/en/api/concepts#globs
[2]: https://www.npmjs.com/package/gulp-modernizr#settings

## Hooks

| name        | type          | description                                                |
| ----------- | ------------- | ---------------------------------------------------------- |
| `generated` | [lazypipe][2] | executed after the modernizr build file has been generated |

[2]: https://github.com/OverZealous/lazypipe

## Example

```js
const $ = require('@wok-cli/core');
const modernizr = require('@wok-cli/task-modernizr');

exports.modernizr = $.task(modernizr, {
  src: ['src/**/*.{js,css}'],
  dest: 'public/assets/',
});
```
