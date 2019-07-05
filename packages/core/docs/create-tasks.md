# Sharable Tasks

Sharable tasks let you define a gulp task blueprint that can act differently based on runtime parameters or environmental variables.

## Anatomy of a Sharable Task

At its root it's a function (let's call it the _creator_ function )that, when executed, returns another function (the gulp _task_ function). Here is an example:

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

## Task Function Hooks
