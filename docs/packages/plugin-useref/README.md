## gulp-useref for Wok

This plugin implements [gulp-useref](https://www.npmjs.com/package/gulp-useref).

| Hook types | Production only | Purpose             |
| ---------- | --------------- | ------------------- |
| lazypipe   | yes             | assets optimization |

<!-- TOC -->

- [gulp-useref for Wok](#gulp-useref-for-wok)
- [Installation](#installation)
- [Parameters](#parameters)
- [Usage](#usage)
  - [Custom Blocks](#custom-blocks)

<!-- /TOC -->

## Installation

This plugin requires `@wok-cli/core`.

```
npm i @wok-cli/core @wok-cli/plugin-useref --save-dev
```

## Parameters

Configuration path: `useref`.

| parameter    | type              | default | note                           |
| ------------ | ----------------- | ------- | ------------------------------ |
| `sourcemaps` | boolean<br>string |         | write sourcemaps<sup>(1)</sup> |

1. Defaults to the value of `env.sourcemaps`.

All other parameters will be used as gulp-useref [configuration options](https://www.npmjs.com/package/gulp-useref#options).

Note that the `searchPath` and `base` options are enhanced with support for environment templates.

## Usage

The most common usage scenario of this plugin is with [@wok-cli/task-views](#TODO):

```js
const $ = require('@wok-cli/core');
const views = require('@wok-cli/task-views');
const useref = require('@wok-cli/plugin-useref');

const viewsTask = $.task(views, {
  src: ['src/**/*.html'],
  dest: 'public',
});

viewsTask.tap('post', 'useref', useref);

exports.views = viewsTask;
```

Refer to [gulp-useref](https://www.npmjs.com/package/gulp-useref) documentation for usage details.

### Custom Blocks

gulp-useref allows you to do custom processing via [custom blocks](https://github.com/jonkemp/useref#custom-blocks).

This plugin implements by default a custom `replace` block, which can be used to replace a `script` tag src attribute without processing the source file.

Example input:

```html
<!-- build:replace /vendors/modernizr.min.js defer -->
<script src="/vendors/modernizr.js" defer></script>
<!-- endbuild -->
```

Output with `--production`:

```html
<script src="/vendors/modernizr.min.js" defer></script>
```
