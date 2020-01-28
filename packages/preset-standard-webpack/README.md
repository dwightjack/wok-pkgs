# @wok-cli/preset-standard-webpack

A preset extension for @wok-cli/preset-standard that replaces the default script task with one that uses the webpack blundler (uses [`@wok-cli/task-webpack`](/packages/task-webpack/)).

<!-- TOC -->

- [Installation](#installation)
- [Usage](#usage)
- [How it works](#how-it-works)

<!-- /TOC -->

## Installation

This preset requires `@wok-cli/preset-standard`.

```
npm i gulp @wok-cli/preset-standard @wok-cli/preset-standard-webpack --save-dev
```

## Usage

In your `gulpfile.js` add the preset entry point after the one for the `present-standard` package:

```js
const $ = require('@wok-cli/core');
const preset = $.preset([
  '@wok-cli/preset-standard',
  '@wok-cli/preset-standard-webpack',
]);

module.exports = preset.resolve();
```

## How it works

This preset replaces the default `scripts` task and its related watcher with one powered by `@wok-cli/task-webpack`.

Changes under the hood:

- the webpack entry point is `./<%= paths.src.root %>/<%= paths.scripts %>/application.js`. Bundled file will be outputted in the same folder as before

- `gulp scripts` will run the bundler.
- production minification is managed by webpack itself.
- during development (`gulp serve`) the bundle will be served via [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware) with full page reload on change. To enable HMR set `hot: true` on your configuration file (`wok.config.js`).
