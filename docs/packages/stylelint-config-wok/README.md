# @wok-cli/stylelint-config-wok <sub>1.0.2<sub>

Shared stylelint config for Wok-based templates. Based on [stylelint-config-standard](https://github.com/stylelint/stylelint-config-standard) and [stylelint-scss](https://github.com/kristerkari/stylelint-scss).

## Installation

This plugin requires `stylelint>=10.0.0` as peer dependency.

```sh
npm i stylelint @wok-cli/stylelint-config-wok --save-dev
```

## Usage

Set your [stylelint config](https://stylelint.io/user-guide/configuration#loading-the-configuration-object) to:

```json
{
  "extends": "@wok-cli/stylelint-config-wok"
}
```
