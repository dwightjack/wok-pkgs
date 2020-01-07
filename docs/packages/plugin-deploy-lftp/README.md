# LFTP Deploy Adapter Plugin <sub>1.0.2<sub>

You can use this plugin with the `deploy` task of `@wok-cli/tasks` to add the ability to upload and sync your files via FTP, SFTP, FTPS.

This package implements [node-ftp](https://www.npmjs.com/package/ftps) and requires [lftp](https://lftp.yar.ru/) to be installed on your machine.

| Hook types | Production only | Purpose      |
| ---------- | --------------- | ------------ |
| promise    | no              | build deploy |

## Why lftp?

[lftp](https://lftp.yar.ru/) comes with a mirroring feature that tries to keep your local and remote files in sync, removing old files and uploading updated or new files only.

If you have just an ftp connection to your remote host this is the closest you can get to rsync.

## Installation

This task requires `@wok-cli/core` as peer dependency.

```
npm i @wok-cli/core @wok-cli/plugin-deploy-lftp --save-dev
```

## Usage

First of all update or add your [remote target](https://dwightjack.github.io/wok-pkgs/#/packages/core/cli?id=deploy-targets) to the `wok.config.js` file and set the deploy strategy to either `'ftp'`, `'sftp'` or `'ftps'` (depending on your remote host's configuration).

```js
// wok.config.js
module.exports = {
  // .... other configs

  targets: {
    ftpserver: {
      host: 'ftp.mydomain.com',
      username: 'ftpuser',
      password: 'password',
      path: 'public',
      deployStrategy: 'ftp',
    },
  },
};
```

**Notes:**

- `targets.ftpserver.path` will be used as the remote base directory for upload.
- `@wok-cli/plugin-deploy-lftp` will ignore any target with other `deployStrategy`.

Then configure the plugin as a strategy for `@wok/tasks`'s deploy task:

```js
const $ = require('@wok-cli/core');
const { deploy } = require('@wok-cli/tasks');
const lftp = require('@wok-cli/plugin-deploy-lftp');

const deployTask = $.task(deploy, {
  src: 'dist/', // folder where the compiled files is stored
});

deployTask.tap('strategy', 'lftp', lftp);

export.deploy = deployTask
```

Finally to upload your files run:

```
gulp deploy --target=ftpserver
```

### Default Deploy Strategy

You can define ftp as the default deploy strategy by adding a `deployStrategy` key to the root of your wok config object:

```diff
// wok.config.js
module.exports = {
  // .... other configs

+ deployStrategy: 'ftp',
  targets: {
    ftpserver: {
      host: 'ftp.mydomain.com',
      username: 'ftpuser',
      password: 'password',
      path: 'public',
-     deployStrategy: 'ftp',
    },
  },
};
```
