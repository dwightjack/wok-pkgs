## lftp Deploy Adapter Plugin

You can use this plugin with the `deploy` task of `@wok-cli/tasks` to add the ability to upload and sync your files via FTP, SFTP, FTPS.

This package implements [node-ftp](https://www.npmjs.com/package/ftps) and requires [lftp](https://lftp.yar.ru/) to be installed on your machine.

## Why lftp?

[lftp](https://lftp.yar.ru/) comes with a mirroring feature that tries to keep your local and remote files in sync, removing old files and uploading updated or new files only.

If you have just an ftp connection to your remote host this is the closest you can get to rsync.

## Installation

```
npm i @wok-cli/plugin-deploy-lftp --save-dev
```

## Usage

First of all update or add you remote host to the `wok.config.js` file and set the deploy strategy to either `'ftp'`, `'sftp'` or `'ftps'` (depending on your remote host's configuration).

```js
// wok.config.js
module.exports = {
  // .... other configs

  hosts: {
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

Note that `hosts.production.path` will be used as the remote base directory for upload.

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
  hosts: {
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
