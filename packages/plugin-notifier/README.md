# Wok Notifier Plugin

Implements build status notification via [node-notifier](https://www.npmjs.com/package/node-notifier).

| Hook types | Production only | Purpose              |
| ---------- | --------------- | -------------------- |
| any        | no              | Developer experience |

## Installation

```
npm i @wok-cli/plugin-notifier --save-dev
```

## Environmental variables

This plugin can be switched on/off by setting the boolean flag `enableNotify`:

```js
// wok.config.js
module.exports = {
  // ...
  enableNotify: false, // disable notifications
};
```

## Parameters

Configuration path: `notifier`.

| parameter | type   | default                                       | note                 |
| --------- | ------ | --------------------------------------------- | -------------------- |
| `title`   | string | package.json `title` field or `'application'` | Notification title   |
| `message` | string |                                               | Notification message |

## Usage

Notify the user when files are copied:

```js
const $ = require('@wok-cli/core');
const { copy } = require('@wok-cli/tasks');
const notifier = require('@wok-cli/plugin-imagemin');

const copyTask = $.task(copy, {
  src: 'static/**/*.*',
  dest: 'public/',
  'hooks:complete': {
    notifier: { message: 'Copy completed!' }
  },
});

copyTask.tap('complete', 'notifier', notifier);

export.copy = copyTask
```

Use the complete hook of a noop task to notify the user when a series of tasks have completed:

```js
const $ = require('@wok-cli/core');
const { clean, copy, noop } = require('@wok-cli/tasks');
const notifier = require('@wok-cli/plugin-notifier');

const cleanTask = $.task(clean, {
  pattern: 'public/',
});

const copyTask = $.task(copy, {
  src: 'static/**/*.*',
  dest: 'public/'
});

const notifyTask = $.task(noop, {
  notifier: { message: 'Build completed!' }
});

notifyTask.tap('complete', 'notifier', notifier);

export.copy = $.series(cleanTask, copyTask, notifyTask);
```
