## rsync Deploy Adapter Plugin

You can use this plugin with the `deploy` task of `@wok-cli/tasks` to add the ability to sync your local and remote folders via rsync.

This package implements [rsyncwrapper](https://www.npmjs.com/package/rsyncwrapper) and requires rsync to be installed on your machine.

## Installation

```
npm i @wok-cli/plugin-deploy-rsync --save-dev
```

## Usage

First of all update or add you remote host to the `wok.config.js` file and set the deploy strategy to `'rsync'`.

```js
// wok.config.js
module.exports = {
  // .... other configs

  hosts: {
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

Note that `hosts.production.path` will be used as the remote base directory for upload.

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
  hosts: {
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