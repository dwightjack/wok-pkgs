# SSH Task

Sharable tasks to execute ssh commands against a remote target. Uses [ssh2](https://github.com/mscdex/ssh2) under the hood.

<!-- TOC -->

- [Installation](#installation)
- [SSH Deploy Target](#ssh-deploy-target)
- [Parameters](#parameters)
- [Hooks](#hooks)
- [Example](#example)
- [Commands](#commands)
  - [Template variables in commands](#template-variables-in-commands)
  - [Execution Pre-checks](#execution-pre-checks)

<!-- /TOC -->

## Installation

This task requires `@wok-cli/core` as peer dependency.

```
npm i @wok-cli/core @wok-cli/task-ssh --save-dev
```

## SSH Deploy Target

This task leverages [deploy targets](packages/core/cli#deploy-targets) to let you choose a remote target at execution time.

```js
// wok.config.js
module.exports = {
  // .... other configs

  targets: {
    production: {
      host: '192.168.1.1',
      username: 'sshuser',
      password: 'password',
      path: '/home/www/public'
      port: 22,
    },
  },
};
```

```
gulp ssh --target=production
```

## Parameters

| parameter  | type     | default | note                                       |
| ---------- | -------- | ------- | ------------------------------------------ |
| `command`  | string   |         | Specific command to execute                |
| `commands` | object   |         | Map of executable commands (see below)     |
| `excludes` | string[] |         | Array of files to exclude (supports globs) |

## Hooks

This task does not expose any hook.

## Example

```js
const $ = require('@wok-cli/core');
const ssh = require('@wok-cli/task-ssh');

exports.ssh = $.task(ssh, {
  src: ['public/**/*'],
});
```

## Commands

Commands are a set of operations (usually a bash compatible set of instructions) to be executed on the remote target.

They can be defined via the `commands` parameter of the sharable task or in a `commands` key of your `wok.config.js` file.

```js
// wok.config.js
module.exports = {
  targets: {
    // ...
  },
  commands: {
    // list all files in a folder
    list: 'ls -la',
  },
};
```

To call a specific command either define it in the `command` parameter or programmatically select it with the `--command` CLI argument:

```
gulp ssh --target=production --command=list
```

### Template variables in commands

Commands supports [lodash-like templates](https://lodash.com/docs/4.17.14#template). Avaiable variables are:

- `env`: Configuration [`$.env`](/packages/core/configuration?id=env) object
- `target`: the current target object as defined in the configuration file
- `excludes`: the `excludes` parameter (see [above](#parameters))

```js
// wok.config.js
module.exports = {
  targets: {
    production: {
      host: '192.168.1.1',
      username: 'sshuser',
      password: 'password',
      path: '/home/www/public'
      port: 22,
    },
  },
  commands: {
    // list all files in /home/www/public
    list: 'ls -la <% target.path %>',
  },
};
```

### Execution Pre-checks

You can define a test function to run before executing the command. In this case a command property must be defined as an object with two keys:

- `test`: test function. Receives the target object and [`$.env`](packages/core/configuration#env) as arguments.
- `exec`: the command template string.

```js
// wok.config.js
module.exports = {
  targets: {
    // ...
  },
  commands: {
    // list all files in /home/www/public
    // just if the target has a path property
    list: {
      test: (target) => !!target.path,
      exec: 'ls -la <% target.path %>',
    },
  },
};
```
