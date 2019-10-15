# @wok-cli/preset-standard <sub>1.0.0<sub>

A standard preset with pre-configured common tasks for Wok.

<!-- TOC -->

- [Installation](#installation)
- [Usage](#usage)
- [Environmental Defaults](#environmental-defaults)
- [Folder Structure](#folder-structure)
- [Exposed tasks](#exposed-tasks)
  - [bump](#bump)
  - [clean](#clean)
  - [copy](#copy)
  - [styles](#styles)
  - [scripts](#scripts)
  - [modernizr](#modernizr)
  - [views](#views)
    - [Subfolders](#subfolders)
    - [Nunjucks globals](#nunjucks-globals)
  - [server](#server)
  - [watch](#watch)
  - [default](#default)
  - [serve](#serve)
- [Extending the configuration](#extending-the-configuration)
- [Configuring Babel](#configuring-babel)

<!-- /TOC -->

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

Alternatively to point (1) you can reference the preset config in a `wok` property in your project's `package.json`:

```json
{
  "name": "my-project",
  // ...
  "wok": "@wok-cli/preset-standard/config"
}
```

## Environmental Defaults

This preset sets the following environmental options:

| parameter  | value  | description                                   |
| ---------- | ------ | --------------------------------------------- |
| lint       | `true` | lints JavaScript and CSS files on build       |
| sourcemaps |        | writes external sourcemaps during development |
| paths      |        | an object with path fragments                 |

## Folder Structure

The `paths` object defines the expected folders structure as follows:

```sh
├─ application # sources root folder
│  ├─ assets
│  │  ├─ javascripts # JavaScript files
│  │  ├─ stylesheets # SASS files
│  ├─ vendors # 3rd party files not installed by any package manager
│  ├─ fixtures # Data files. May contain JSON, JS, Markdown, etc...
│  ├─ views # Nunjucks/HTML files
│  │  ├─ partials # View partials
│  │  ├─ templates # Nunjucks templates
│  │  ├─ *.njk # Views
├─ static # Files to be copied into `public` "as-is" like images, fonts, videos
├─ public # Build destination folder
```

## Exposed tasks

### bump

Implements [@wok-cli/task-bump](https://dwightjack.github.io/wok-pkgs/#/packages/task-bump/).

### clean

Removes all files in the `public` folder.

### copy

Copies files from the `static` folder into the `public` folder. Image files will be processed using [@wok-cli/plugin-imagemin](https://dwightjack.github.io/wok-pkgs/#/packages/plugin-imagemin/).

### styles

Processes CSS and SCSS files in `application/assets/stylesheets` and outputs the results in `public/assets/stylesheets`. SCSS files are processed using [@wok-cli/plugin-sass](https://dwightjack.github.io/wok-pkgs/#/packages/plugin-sass/).

Files will be linted with [gulp-stylelint](https://www.npmjs.com/package/gulp-stylelint) before processing. Set the `lint` [property](#environmental-defaults) to `false` to disable the linter.

Note: `node-sass` [includePaths](https://github.com/sass/node-sass#includepaths) options is set by default to: `['application/vendors', 'node_modules']`.

### scripts

Processes JavaScript files in `application/assets/javascripts` and outputs the results in `public/assets/javascripts`. Files will be parsed using Babel. See [below](#configuring-babel) for configuration options.

Files will be linted with [gulp-eslint](https://www.npmjs.com/package/gulp-eslint) before processing. Set the `lint` [property](#environmental-defaults) to `false` to disable the linter.

### modernizr

Generates a custom [Modernizr](https://modernizr.com/) build parsing JavaScript, CSS and SCSS files in the `application/assets/javascripts` and `application/assets/stylesheets` folders. The output build will be saved into the `public/vendors/modernizr` folder.

Implements [@wok-cli/task-modernizr](https://dwightjack.github.io/wok-pkgs/#/packages/task-modernizr/).

### views

Processes view files in `application/views` and outputs the results into `public`.

This task implements the following modules:

- [@wok-cli/task-views](https://dwightjack.github.io/wok-pkgs/#/packages/task-views/)
- [@wok-cli/plugin-render-nunjucks](https://dwightjack.github.io/wok-pkgs/#/packages/plugin-render-nunjucks/): Nunjucks templates support.
- [@wok-cli/plugin-useref](https://dwightjack.github.io/wok-pkgs/#/packages/plugin-useref/): Assets replace and concatenation (production only).

#### Subfolders

You can create as many sub-folders in `application/views` as your project requires. Note that `template` is a reserved folder for extendable Nunjucks templates and `partials` should only be used for HTML/Nunjucks partials.

Files starting with `_` will be ignored.

#### Nunjucks globals

The task will also parse [JSON view data sources](https://dwightjack.github.io/wok-pkgs/#/packages/task-views/?id=setup-a-data-source) from `application/fixtures/` and expose them to the Nunjucks templates as global objects.

It will also expose two additional global objects:

- `_`: the [lodash](https://lodash.com/) library
- `faker`: the [faker](https://www.npmjs.com/package/faker) library

### server

Runs a static server on `localhost:8000` serving the `public` and `static` folder.

Implements [@wok-cli/task-server](https://dwightjack.github.io/wok-pkgs/#/packages/task-serve/).

### watch

Watches files in `application` and `static` for changes, processes them and reloads the page.

CSS files trigger a live-reload (file injection) instead of a full reload.

### default

The default task (executed by running `gulp` on a terminal) will perform the following tasks:

- `clean`
- `copy`
- `styles`
- `scripts`
- `modernizr`
- `views`

For production builds, assets will be revised using [@wok-cli/task-rev](https://dwightjack.github.io/wok-pkgs/#/packages/task-rev/) and scripts will be minified with [gulp-minify](https://www.npmjs.com/package/gulp-minify).

### serve

A shorthand task executing the following tasks: `default`, `watch` and `server`.

Note: when executed within `serve` the `default` task will not copy files from `static` to `public`.

## Extending the configuration

The preset exposes a configuration function that returns an object that you can extend to customize it:

```js
module.exports = (env) => {
  const presetConfig = require('@wok-cli/preset-standard/config')(env);

  return {
    ...presetConfig,
    // add your properties here
  };
};
```

## Configuring Babel

This plugin comes with a default configuration for Babel based on [@babel/preset-env](https://babeljs.io/docs/en/babel-preset-env) and including [@babel/plugin-proposal-class-properties](https://babeljs.io/docs/en/babel-plugin-proposal-class-properties).

`@babel/preset-env` is configured with the following options:

```
{
  modules: false,
  loose: true,
  useBuiltIns: false,
}
```

In order to use this configuration on your project create a `.babelrc.js` file in the root folder of your project and add the following content:

```js
module.exports = require('@wok-cli/preset-standard/configs/babel');
```

Also remember to configure [target browsers](https://babeljs.io/docs/en/babel-preset-env#browserslist-integration) by adding a `browserslist` property to your project's `package.json`:

```json
{
  // ...
  "browserslist": [
    ">= 1%",
    "last 1 Chrome version",
    "last 1 ChromeAndroid version",
    "last 1 Edge version",
    "last 1 Firefox version",
    "last 1 iOS version",
    "last 1 Safari version"
  ]
}
```
