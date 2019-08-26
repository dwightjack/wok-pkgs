# @wok-cli/eslint-config-wok

Shared config for Wok-based templates.

## Installation

```sh
npm i @wok-cli/eslint-config-wok --save-dev
```

## Usage

This package exposes two main configurations:

### Frontend sources configuration

This configuration is based on [eslint-config-airbnb-base](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb-base), use it to lint source files intended to be executed on the browser.

Add `"extends": "@wok-cli/eslint-config-wok/web"` to your `.eslintrc.json` file.

**Note**: this configuration is aliased as the package main entry as well:

```
// load the web configuration

"extends": "@wok-cli/eslint-config-wok"
```

### Node sources configuration

This configuration is based on [eslint-plugin-node](https://github.com/mysticatea/eslint-plugin-node), use this configuration for source files intended for usage on Node.js.

Add `"extends": "@wok-cli/eslint-config-wok/node"` to your `.eslintrc.json` file.

**Note**: Remember to set the correct target Node.js version in your package.json in order for eslint-plugin-node to work correctly. Example:

```json
"engines": {
  "node": ">=8.10.0"
}
```

### Usage with prettier

In order to make this configuration interoperable with [prettier](https://prettier.io/) you have to add the `-prettier` suffix to the configuration name:

- `@wok-cli/eslint-config-wok/web` -> `@wok-cli/eslint-config-wok/web-prettier`
- `@wok-cli/eslint-config-wok/node` -> `@wok-cli/eslint-config-wok/node-prettier`

**Note**: this configuration implements the recommended configuration from [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier#recommended-configuration).
