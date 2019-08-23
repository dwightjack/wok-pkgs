# eslint-config-wok

Shared config for Wok-based templates.

## Installation

```sh
npm i @wok-cli/eslint-config-wok --save-dev
```

## Usage

This package exposes two configurations. Both configurations implement [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier).

### Frontend sources configuration

This configuration is based on [eslint-config-airbnb-base](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb-base), use it to lint source files intended to be executed on the browser.

Add `"extends": "@wok-cli/eslint-config-wok"` to your `.eslintrc.json` file.

### Node sources configuration

This configuration is based on [eslint-plugin-node](https://github.com/mysticatea/eslint-plugin-node), use this configuration for source files intended for usage on Node.js

Add `"extends": "@wok-cli/eslint-config-wok/node"` to your `.eslintrc.json` file

**Note**: Remember to set the correct target Node.js version in your package.json in order for eslint-plugin-node to work correctly. Example:

```json
"engines": {
  "node": ">=8.10.0"
}
```
