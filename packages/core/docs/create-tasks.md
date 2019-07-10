# Sharable Tasks

Sharable tasks let you define a gulp task blueprint that can act differently based on runtime parameters or environmental variables.

<!-- TOC -->

- [Anatomy of a Sharable Task](#anatomy-of-a-sharable-task)
  - [Creator Function Arguments](#creator-function-arguments)
- [Generating a task function from a creator function](#generating-a-task-function-from-a-creator-function)
- [Task Function Hooks](#task-function-hooks)
- [Conditional Task Execution](#conditional-task-execution)
- [Task plugins](#task-plugins)
  - [Plugin parameters](#plugin-parameters)
    - [Computed parameters](#computed-parameters)
  - [`createPlugin` Signature](#createplugin-signature)

<!-- /TOC -->

## Anatomy of a Sharable Task

At its root a sharable task is a function (let's call it the _creator_ function ) that, when executed, returns another function (the gulp _task_ function). Here is an example:

```js
function myTaskCreator(gulp, params, env, api) {
  return function myTask() {
    return gulp.src(/* pattern here */).pipe(/* ... gulp plugins...*/);
  };
}
```

### Creator Function Arguments

The creator function should be authored to receive the following arguments

| name   | type   | description                           |
| ------ | ------ | ------------------------------------- |
| gulp   | Gulp   | A gulp module instance                |
| params | object | Custom parameters                     |
| env    | object | [configuration object environment][1] |
| api    | object | [configuration object API][2]         |

[1]: packages/core/configuration#env
[2]: packages/core/configuration#api

## Generating a task function from a creator function

The easiest way to create a task function from a sharable task is by generating a configuration object and use its `task()` method.

```js
// tasks/copy.js
module.exports = function copyCreator(gulp, params) {
  return function copy() {
    return gulp.src(params.src).pipe(params.dest);
  };
};
```

```js
// gulpfile.js
const gulp = require('gulp');
const config = require('@wok-cli/core');
const copyCreator = require('./tasks/copy.js');

// 1. create a configuration object
const $ = config(gulp);

// use the task method and export the returned task function
exports.copy = $.task(copyCreator, {
  src: 'static/**',
  dest: 'public',
});
```

?> Learn more about WOK configuration objects in the [dedicated guide](packages/core/configuration).

## Task Function Hooks

As a task author you might want to give your users the ability to interact with the task flow.

This can be achieved by defining task's hooks. Starting from the example above let's say we want the user to be able to process copied files before the got written onto the destination folder:

```diff
// tasks/copy.js
module.exports = function copyCreator(gulp, params) {
+ // get the task's hooks list
+ const $hooks = this.getHooks();
  return function copy() {
    return gulp
      .src(params.src)
+     .pipe($hooks.call('process'))
      .pipe(params.dest);
  };
};
```

End users will be able to hook into the copy stream by calling the `.tap` method of the task function:

```js
// gulpfile.js

// ...

const copy = $.task(copyCreator, {
  src: 'static/**',
  dest: 'public',
});

copy.tap('process', 'myhook', (lazypipe, env) => {
  if (env.production) {
    return lazypipe.pipe(/* do something here in production */);
  }
  // do nothing in development
  return lazypipe;
});

exports.copy = copy;
```

?> Learn more about Hooks at the [dedicated guide](packages/core/hooks).

## Conditional Task Execution

In some cases you might want to control tasks execution based on a condition.
A common scenario is a series of tasks composed with `gulp.series` where one of the tasks is only relevant in production.

To address this scenario you can use the `runif` utility function:

```js
// ... configuration and tasks setup
const { runif } = require('@wok-cli/core/utils');

exports.build = gulp.series(
  copy,
  scripts,
  runif(() => $.env.production, minify),
);
```

`runif` accepts two arguments:

| name      | type     | description                                    |
| --------- | -------- | ---------------------------------------------- |
| condition | function | condition to test. Must return a boolean value |
| task      | function | a gulp-compliant task                          |

If the condition returns `true` it will execute the task else it will complete right away and step to the next task (if any).

## Task plugins

As we have seen in the previous section, task hooks can be leveraged to allow users to interact with sharable tasks by adding hook functions via the `.tap()` method.

In WOK task hook functions are called **task plugins**.

To simplify and standardize plugin development WOK exposes an utility function to create such hook functions called `createPlugin`. Let's rewrite the last example with this utility.

```diff
// gulpfile.js

// ...

+ const { createPlugin } = require('@wok-cli/core/utils');

const copy = $.task(copyCreator, {
  src: 'static/**',
  dest: 'public',
});

+ const myPlugin = createPlugin({
+   name: 'myplugin',
+   productionOnly: true,
+   plugin(lazypipe) {
+     return lazypipe.pipe(/* do something here in production */);
+   },
+ });

- copy.tap('process', 'myhook', (lazypipe, env) => {
-   if (env.production) {
-     return lazypipe.pipe(/* do something here in production */);
-   }
-   // do nothing in development
-   return lazypipe;
- });

+ copy.tap('process', 'myhook', myPlugin);

exports.copy = copy;
```

### Plugin parameters

Plugins created with the `createPlugin` function requires a `name` configuration property. That name can be used in the task creator parameters as a property to pass plugin-specific configuration parameters.

Let's see an example:

```js
// plugins/my-plugin.js
module.exports = createPlugin({
  name: 'myplugin',
  productionOnly: true,
  plugin(lazypipe, params) {
    console.log(params.message);
    return lazypipe;
  },
});
```

```js
// gulpfile.js
// ...
const myPlugin = require('./plugins/my-plugin.js');

const copy = $.task(copyCreator, {
  src: 'static/**',
  dest: 'public',
  myplugin: 'Hello World!',
});

copy.tap('process', 'myhook', myPlugin);

exports.copy = copy;
```

When executed with `gulp copy --production` the copy task will log `Hello World!`. (note the `myplugin` key in the task parameters object).

#### Computed parameters

In alternative to the plugin's name you can use the `params` function property to dynamically compute a
plugin parameters from the task parameters:

```diff
// plugins/my-plugin.js
module.exports = createPlugin({
  name: 'myplugin',
  productionOnly: true,
+ params(taskParams) {
+   return {
+     message: `Copying files to "${taskParams.dest}"`
+   }
+ },
  plugin(lazypipe, params) {
    console.log(params.message);
    return lazypipe;
  },
});
```

Applying the previous changes the task will log `Copying files to "public"`.

### `createPlugin` Signature

The `createPlugin` utility accepts an object as argument with the following properties:

| name           | type     | description                                                                                                                          |
| -------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| name           | string   | Plugin name                                                                                                                          |
| plugin         | function | The [hook function][1]                                                                                                               |
| productionOnly | boolean  | (optional) If se to `true` will execute the plugin just in production (default `false`)                                              |
| test           | function | (optional) Returns a boolean to control plugins execution. Receives the configuration [`env` object][2] and the plugin's parameters. |
| params         | function | (optional) A function to return computed plugin parameters. Receives the task parameters object as its only argument.                |

[1]: packages/core/hooks#hook-function-signature
[2]: packages/core/configuration#env
