## Wok Nunjucks renderer

[Nunjucks](https://mozilla.github.io/nunjucks/) template renderer for [`@wok-cli/task-views`](#TODO).

| Hook types | Production only | Purpose          |
| ---------- | --------------- | ---------------- |
| Map        | no              | Output rendering |

<!-- TOC -->

- [Wok Nunjucks renderer](#wok-nunjucks-renderer)
- [Installation](#installation)
- [Parameters](#parameters)
- [Usage](#usage)
  - [Setting global helpers](#setting-global-helpers)

<!-- /TOC -->

## Installation

This plugin requires `@wok-cli/core` and `@wok-cli/task-views` as peer dependencies.

```
npm i @wok-cli/core @wok-cli/task-views @wok-cli/plugin-render-nunjucks --save-dev
```

## Parameters

Configuration path: `nunjucks`.

| parameter | type               | default | note                                        |
| --------- | ------------------ | ------- | ------------------------------------------- |
| `root`    | string<br>string[] |         | Templates root folders<sup>(1)</sup>        |
| `helpers` | function           |         | Global helpers                              |
| `env`     | function           |         | Nunjucks environment enhancer               |
| `...opts` | object             |         | Nunjucks environment options <sup>(2)</sup> |

1. Supports environment templates. it will be used as first argument for [nunjucks.configure](https://mozilla.github.io/nunjucks/api.html#configure).
2. Any other parameter will be passed as the `opts` argument to [nunjucks.configure](https://mozilla.github.io/nunjucks/api.html#configure).

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

### Setting global helpers

Global helpers are functions and variables available in every template on the `helpers` object.

To define global helpers set a `helpers` function on the `hooks:engines -> nunjucks` task parameters.

The function receives the `opts` parameters and the [Wok environment configuration object](#TODO).
