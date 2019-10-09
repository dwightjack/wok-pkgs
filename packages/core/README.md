# @wok-cli/core

This package includes core functionalities and utilities to setup a flexible and reusable build tool chain with gulp.

`@wok-cli/core` is built on top of gulp and features project configuration files, CLI arguments, sharable tasks and more.

## Installation

This modules requires node.js v8.12.0 or newer and [gulp 4+](https://gulpjs.com/).

```
npm i gulp @wok-cli/core
```

## Usage example

Here is a simple copy task with CLI parameters support:

```js
// gulpfile.js
const $ = require('@wok-cli/core');

const { env } = $;

const srcPattern = 'src/**';

exports.copy = function copy() {
  return gulp.src(srcPattern).pipe(gulp.dest(env.argv.dest));
};
```

The above `copy` task will read every file in `srcPattern` and copy it to a folder provided with the `--dest` cli parameter.

You may run the task like this:

```bash
gulp copy --dest=public
```

### Reusable tasks

Where `@wok-cli/core` shines is the ability to let you create sharable and configurable tasks with ease. For example, let's extract the previous `copy` task to its own module.

We need to expose and _higher-order function_ that receives some parameters and returns the configured task.

```js
// tasks/copy.js

module.exports = function copyTask(gulp, params, env) {
  // this is the actual gulp task function
  return function copy() {
    return gulp.src(params.src).pipe(gulp.dest(env.argv.dest));
  };
};
```

Then in the `gulpfile.js` we leverage the `$.task` function to parse and configure the task:

```js
// gulpfile.js
const $ = require('@wok-cli/core');
const copyTask = require('./tasks/copy.js');

const srcPattern = 'src/**';

exports.copy = $.task(copyTask, {
  src: srcPattern,
});
```

## Learn More

The package comes with many more features like:

- environment specific configuration
- hookable tasks
- chainable presets

Learn more about those features in the [documentation](https://dwightjack.github.io/wok-pkgs/#/packages/core/).
