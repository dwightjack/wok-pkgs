# Sharable Tasks

Sharable tasks let you define a gulp task blueprint that can act differently based on runtime parameters or environmental variables.

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

copy.tap('process', 'myhook', (lazypipe) => {
  return lazypipe.pipe(/* do something here*/);
});

exports.copy = copy;
```

?> Learn more about Hooks at the [dedicated guide](packages/core/hooks).
