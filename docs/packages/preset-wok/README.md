# @wok-cli/preset-wok <sub>1.0.2<sub>

A preset for the Wok boilerplate. Extends [`@wok-cli/preset-standard`](/packages/preset-standard/).

<!-- TOC -->

- [Installation](#installation)
- [Usage](#usage)
- [Environmental Defaults](#environmental-defaults)
  - [Deploy and rollback:](#deploy-and-rollback)
    - [SSH and rsync](#ssh-and-rsync)
    - [FTP](#ftp)
  - [Other Gulp tasks](#other-gulp-tasks)

<!-- /TOC -->

## Installation

This preset requires `@wok-cli/preset-standard`, `@wok-cli/core` and `gulp`.

```
npm i gulp @wok-cli/core @wok-cli/preset-standard @wok-cli/preset-wok --save-dev
```

## Usage

1. Create a `wok.config.js` file in the root folder of your project with the following code:

```js
module.exports = require('@wok-cli/preset-wok/config');
```

2. Create a `gulpfile.js` in the root folder of your project with the following code:

```js
const $ = require('@wok-cli/core');
const preset = require('@wok-cli/preset-wok');

const wok = preset($);

module.exports = wok.resolve();
```

Alternatively to point (1) you can reference the preset config in a `wok` property in your project's `package.json`:

```json
{
  "name": "my-project",
  // ...
  "wok": "@wok-cli/preset-wok/config"
}
```

This preset depends and extends `@wok-cli/preset-standard`. Refer to its [documentation](/packages/preset-standard/) for any additional configuration and implementation detail.

## Environmental Defaults

This preset sets the following environmental options:

| parameter | value | description                                |
| --------- | ----- | ------------------------------------------ |
| commands  |       | A set of ssh commands used by the ssh task |

### Deploy and rollback:

#### SSH and rsync

The preset implements a simple set of deploy tasks requiring SSH remote access and [rsync](https://rsync.samba.org).

To deploy and rollback with rsync first setup your [deploy targets](packages/core/cli#deploy-targets) in `wok.config.js` and ensure the `deployStrategy` is set to `'rsync'`, then run:

```bash
#deploy `paths.dist.root` to remote staging server at `target.path`. A backup of the deploy target folder (`target.path`) will be stored in `target.backup`.
gulp deploy --target=staging

#deploy a production build to remote production server
gulp deploy --production --target=production

#rollback to the previous version in the remote production server
gulp remote --command=rollback --target=production
```

#### FTP

If you are on a shared hosting with FTP access, you can switch to the more basic `ftp` deploy strategy, which uses [lftp](http://lftp.yar.ru) mirroring feature for incremental upload.

To switch to ftp mode, define a `deployStrategy: 'ftp'` property either on the deploy target object or on the root configuration object in `wok.config.js`.

**Note**: Rollback and backup tasks won't be available with this configuration.

See `@wok-cli/plugin-deploy-lftp` [documentation](/packages/plugin-deploy-lftp/) for more details.

### Other Gulp tasks

- The boilerplate implements [`@wok-cli/plugin-notifier`](/packages/plugin-notifier/) for in-development desktop notifications. To disable it, add a `enableNotify: false` property to your `wok.config.js` file.
