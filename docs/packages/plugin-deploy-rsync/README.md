# Rsync Deploy Adapter Plugin <sub>1.0.0<sub>

You can use this plugin with the `deploy` task of `@wok-cli/tasks` to add the ability to sync your local and remote folders via rsync.

This package implements [rsyncwrapper](https://www.npmjs.com/package/rsyncwrapper) and requires rsync to be installed on your machine.

| Hook types | Production only | Purpose      |
| ---------- | --------------- | ------------ |
| promise    | no              | build deploy |

## Installation

```
npm i @wok-cli/plugin-deploy-rsync --save-dev
```

## Usage

First of all update or add a remote target to the `wok.config.js` file and set the deploy strategy to `'rsync'`.

```js
// wok.config.js
module.exports = {
  // .... other configs

  targets: {
    remoteserver: {
      host: 'myserver.com',
      username: 'rsyncuser',
      password: 'password',
      path: '/var/www/mysite/public',
      deployStrategy: 'rsync',
    },
  },
};
```

**Notes:**

- `targets.remoteserver.path` will be used as the remote base directory for upload.
- `@wok-cli/plugin-deploy-rsync` will ignore any target with a `deployStrategy` other than `'rsync'`.

Then configure the plugin as a strategy for `@wok/tasks`'s deploy task:

```js
const $ = require('@wok-cli/core');
const { deploy } = require('@wok-cli/tasks');
const rsync = require('@wok-cli/plugin-deploy-rsync');

const deployTask = $.task(deploy, {
  src: 'dist/', // folder where the compiled files is stored
});

deployTask.tap('strategy', 'rsync', rsync);

export.deploy = deployTask
```

Finally to sync your files run:

```
gulp deploy --target=remoteserver
```

### Default Deploy Strategy

You can define rsync as the default deploy strategy by adding a `deployStrategy` key to the root of your wok config object:

```diff
// wok.config.js
module.exports = {
  // .... other configs

+ deployStrategy: 'rsync',
  targets: {
    remoteserver: {
      host: 'myserver.com',
      username: 'rsyncuser',
      password: 'password',
      path: '/var/www/mysite/public',
-     deployStrategy: 'rsync',
    },
  },
};
```
