# Wok Nunjucks renderer <sub>1.0.1<sub>

[Nunjucks](https://mozilla.github.io/nunjucks/) template renderer for [`@wok-cli/task-views`](#TODO).

| Hook types | Production only | Purpose          |
| ---------- | --------------- | ---------------- |
| Map        | no              | Output rendering |

<!-- TOC -->

- [Wok Nunjucks renderer](#wok-nunjucks-renderer)
- [Installation](#installation)
- [Parameters](#parameters)
- [Usage](#usage)
  - [Global functions](#global-functions)
  - [Setting global helpers](#setting-global-helpers)
  - [Environment Customization](#environment-customization)

<!-- /TOC -->

## Installation

This plugin requires `@wok-cli/core` and `@wok-cli/task-views` as peer dependencies.

```
npm i @wok-cli/core @wok-cli/task-views @wok-cli/plugin-render-nunjucks --save-dev
```

## Parameters

Configuration path: `nunjucks`.

| parameter | type     | default | note                                        |
| --------- | -------- | ------- | ------------------------------------------- |
| `root`    | string   |         | Templates root folder<sup>(1)</sup>         |
| `helpers` | function |         | Global [helpers][1]                         |
| `env`     | function |         | Nunjucks [environment customizer][2]        |
| `...opts` | object   |         | Nunjucks environment options <sup>(2)</sup> |

1. _Supports environment templates. It will be used as first argument for [nunjucks.configure](https://mozilla.github.io/nunjucks/api.html#configure)._
2. _Any other parameter will be passed as the `opts` argument to [nunjucks.configure](https://mozilla.github.io/nunjucks/api.html#configure)._

[1]: #setting-global-helpers
[2]: #environment-customization

## Usage

The plugin will filter files with the `.njk` and `.nunjucks` extension and output a rendered `.html` file.

```js
const $ = require('@wok-cli/core');
const views = require('@wok-cli/task-views');
const nunjucks = require('@wok-cli/plugin-render-nunjucks');

const viewTask = $.task(views, {
  // multiple templates allowed
  src: ['src/**/*.{njk,hbs,html}'],
  dest: 'public',
});

viewTask.tap('engines', 'nunjucks', nunjucks);

export.views = viewTask;
```

### Global functions

This plugin adds the following [global functions](https://mozilla.github.io/nunjucks/api.html#addglobal):

- `url(str)` A function that prepends the value of the `publicPath` [Wok environment object](#TODO) to the passed in string and normalizes it.

### Setting global helpers

Global helpers are functions and variables available in every template on the `helpers` object.

To define global helpers set a `helpers` function on the `hooks:engines -> nunjucks` task parameters.

The function receives the `opts` parameters and the [Wok environment configuration object](#TODO) as arguments

```diff
const $ = require('@wok-cli/core');
const views = require('@wok-cli/task-views');
const nunjucks = require('@wok-cli/plugin-render-nunjucks');

+function helpers(opts, env) {
+  return {
+    // return the name from package.json
+    projectName: () => env.pkg.name;
+  }
+}

const viewTask = $.task(views, {
  // multiple templates allowed
  src: ['src/**/*.{njk,hbs,html}'],
  dest: 'public',
+ 'hooks:engines': {
+   nunjucks: {
+     helpers
+   }
+ }
});

viewTask.tap('engines', 'nunjucks', nunjucks);

export.views = viewTask;
```

With the above example you can access the `projectName` helper function like this:

```html
<p>This project name: {{ helpers.projectName() }}</p>
```

### Environment Customization

You can customize the [Nunjucks environment](https://mozilla.github.io/nunjucks/api.html#environment) instance via the `env` parameter.

The following example will use [`addGlobal`](https://mozilla.github.io/nunjucks/api.html#addglobal) to make the [lodash](https://lodash.com/) library available to every template under the `_` global object:

```diff
const $ = require('@wok-cli/core');
const views = require('@wok-cli/task-views');
const nunjucks = require('@wok-cli/plugin-render-nunjucks');

+ function env(nunjucksEnv) {
+   nunjucksEnv.addGlobal('_', require('lodash'))
+ }

const viewTask = $.task(views, {
  // multiple templates allowed
  src: ['src/**/*.{njk,hbs,html}'],
  dest: 'public',
+ 'hooks:engines': {
+   nunjucks: {
+     env
+   }
+ }
});

viewTask.tap('engines', 'nunjucks', nunjucks);

export.views = viewTask;
```
