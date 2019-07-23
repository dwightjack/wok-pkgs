# CLI Arguments

By default Wok-powered gulp tasks support two CLI arguments:

- [`production`](#production)
- [`target`](#deploy-hosts-and-targets)

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

## Deploy Hosts and Targets

Wok lets you define multiple remote host definitions and choose your host target for deploy at execution time.

To define a remote host add it to the `hosts` key in your configuration file (`wok.config.js`).

```js
module.exports = {
  // .... other configs

  hosts: {
    production: {
      host: 'ftp.mydomain.com',
      username: 'ftpuser',
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

You can retrieve the value of the flag from the `$.env` object:

```
gulp --target=production
```

```js
// gulpfile.js
const $ = require('@wok-cli/core');
console.log($.env.target); // logs 'production'
```

?> When using `--production` the default value for `$.env.target` is `'production'`.
