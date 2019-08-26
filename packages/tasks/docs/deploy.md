# Deploy Task

Base task for project deployment. Enhance it with plugins and hook functions to implement your deploy strategies.

## Deploy Hosts and Targets

This task leverages [deploy targets](packages/core/cli#deploy-hosts-and-targets) to let you choose your deploy target and method at execution time.

To define a deploy strategy for a remote host add a `deployStrategy` key in your configuration file (`wok.config.js`).

```diff
module.exports = {
  // .... other configs

  hosts: {
    production: {
      host: 'ftp.mydomain.com',
      username: 'ftpuser',
      password: 'password',
      path: 'public',
+     deployStrategy: 'rsync',
    },
  },
};
```

Then select it upon task execution via the `--target` option:

```
gulp deploy --target=production
```

The task will use the selected host object as connection settings. `deployStrategy` defines the deploy method for that host. If now defined it will default to the value of the `deployStrategy` key in the config object:

```diff
module.exports = {
  // .... other configs
+ //default to rsync as deploy method
+ deployStrategy: 'rsync'

  hosts: {
    production: {
      host: 'ftp.mydomain.com',
      username: 'ftpuser',
      password: 'password',
      path: 'public',
-     deployStrategy: 'rsync',
    },
  },
};
```

## Parameters

| parameter       | type   | note                                       |
| --------------- | ------ | ------------------------------------------ |
| `src`           | string | source folder <sup>(1)</sup>               |
| `hook:strategy` | object | Hooks configuration parameters (see below) |

1. Supports environment templates.

[1]: https://gulpjs.com/docs/en/api/concepts#globs

## Hooks

| name       | type    | description                      |
| ---------- | ------- | -------------------------------- |
| `strategy` | promise | list of deploy methods functions |

Each `strategy` hook function will receive as 4th argument an object containing, apart from the passed in parameters, the following keys:

- `strategy`: the resolved deploy strategy for the target host
- `target`: the target host object

## Example

```js
const $ = require('@wok-cli/core');
const { deploy } = require('@wok-cli/tasks');

const deployTask = $.task(deploy, {
  src: 'dist/',
});

deployTask.tap('strategy', 'rsync', (promise, env, api, params) => {
  if (!params.strategy === 'rsync') {
    // this host does not support rsync skip!
    return promise;
  }
  return promise.then(() => {
    // deploy with rsync here...
  });
});

exports.deploy = deployTask;
```
