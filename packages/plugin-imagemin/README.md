# Imagemin Plugin

Image optimization plugin for Wok. Implements [gulp-imagemin](https://www.npmjs.com/package/gulp-imagemin).

| Hook types | Production only    | Purpose      |
| ---------- | ------------------ | ------------ |
| lazypipe   | partly<sup>1</sup> | optimization |

1. _svg files are always optimized._

## Installation

```
npm i @wok-cli/plugin-imagemin --save-dev
```

## Usage

When applied to a stream of files this plugin will apply `gulp-imagemin` to matching image files. SVG Files will be always optimized while every other file format will be optimized just on production builds.

One possible injection point is the `process` hook of the copy task in `@wok-cli/tasks`.

```js
const $ = require('@wok-cli/core');
const { copy } = require('@wok-cli/tasks');
const imagemin = require('@wok-cli/plugin-imagemin');

const copyTask = $.task(copy, {
  src: 'static/**/*.*',
  dest: 'public/'
});

copyTask.tap('process', 'imagemin', imagemin);

export.copy = copyTask
```

## Parameters

Configuration path: `imagemin`.

| parameter | type   | default                         | note                              |
| --------- | ------ | ------------------------------- | --------------------------------- |
| `pattern` | string | `'**/*.{png,jpg,gif,svg,webp}'` | Glob pattern matching image files |

```js
// ...

const copyTask = $.task(copy, {
  src: 'static/**/*.*',
  dest: 'public/',
  'hooks:process': {
    // process just jpg and svg files
    imagemin: '**/*.{jpg,svg}',
  },
});

copyTask.tap('process', 'imagemin', imagemin);

// ...
```
