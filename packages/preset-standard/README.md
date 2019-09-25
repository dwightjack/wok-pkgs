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

## Exposed tasks

-
