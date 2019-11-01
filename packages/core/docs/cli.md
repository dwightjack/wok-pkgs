# CLI Arguments

By default Wok-powered gulp tasks support two CLI arguments:

- [`production`](#production)
- [`target`](#deploy-targets)

## Production

The `--production` flag will instruct tasks and plugin to generate a production-ready build.

You can retrieve the value of the flag from the `$.env` object:

```
gulp --production
```

```js
// gulpfile.js
const $ = require('@wok-cli/core');
console.log($.env.production); // logs true
```

## Deploy Targets

Wok lets you define multiple remote targets and choose the one to deploy to at execution time.

To define a remote target, add it to the `targets` key in your configuration file (`wok.config.js`).

```js
module.exports = {
  // .... other configs

  targets: {
    production: {
      host: 'ftp.mydomain.com',
      username: 'productionuser',
      password: 'password',
      path: 'public',
    },
    staging: {
      // ...
    },
  },
};
```

Then select it upon task execution via the `--target` option.

You can retrieve the value of the flag and the correspondent object from the `$.env` object:

```
gulp --target=production
```

```js
// gulpfile.js
const $ = require('@wok-cli/core');
console.log($.env.target); // logs 'production'

const target = $.env.targets[$.env.target];

console.log(target.username); // logs 'productionuser'
```

?> When using `--production` the default value for `$.env.target` is `'production'`.
