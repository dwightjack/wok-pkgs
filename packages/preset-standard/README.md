# @wok-cli/preset-standard

A standard preset with pre-configured common tasks for WOK.

## Installation

This preset requires `@wok-cli/core` and `gulp`.

```
npm i gulp @wok-cli/core @wok-cli/preset-standard --save-dev
```

## Usage

1. Create a `wok.config.js` file in the root folder of your project with the following code:

```js
module.exports = require('@wok-cli/preset-standard/config');
```

2. Create a `gulpfile.js` in the root folder of your project with the following code:

```js
const $ = require('@wok-cli/core');
const preset = require('@wok-cli/preset-standard');

const wok = preset($);

module.exports = wok.resolve();
```

## Environmental Defaults

This preset sets the following environmental options:

| parameter  | value  | description                                   |
| ---------- | ------ | --------------------------------------------- |
| lint       | `true` | lints JavaScript and CSS files on build       |
| sourcemaps |        | writes external sourcemaps during development |
| paths      |        | an object with path fragments                 |

## Folder Structure

### Application Folder Structure

```
├─ application
│  ├─ assets
│  │  ├─ javascripts #JavaScript files
│  │  ├─ stylesheets #SASS files
│  ├─ vendors #3rd party files not installed by any package manager
│  ├─ fixtures #Test data files. May contain JSON, JS, Markdown, etc...
│  ├─ views #Nunjucks files
│  │  ├─ partials #View partials
│  │  ├─ templates #Nunjucks templates
│  │  ├─ *.njk #Views
├─ static #Files to be copied into `public` "as-is" like images, fonts, videos
├─ public #Build destination folder
```

## Exposed tasks

### bump

Implements [@wok-cli/task-bump](https://github.com/fevrcoding/wok-pkgs/tree/master/packages/task-bump).

### clean

Implements [@wok-cli/task-bump](https://github.com/fevrcoding/wok-pkgs/tree/master/packages/task-bump).

### copy

### styles

### scripts

### modernizr

### views

### server
