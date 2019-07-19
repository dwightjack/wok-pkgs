# Presets

Presets expose a chaining API to define sharable sets of tasks and workflows.

Presets let's you setup pre-defined tasks, parameters and hooks.

## Gettings started

A preset must be a module exporting a function. The function will receive a [configuration object](packages/core/configuration).

To initialize a preset chain use the `createPreset` utility function.

```js
// configs/preset.js
const { createPreset } = require('@wok-cli/core/preset');

module.exports = function myPreset(config) {
  const preset = createPreset(config);

  // preset setup here...

  return preset;
};
```

### Task Setup

Let's setup a copy and clean task based on the Wok [copy](packages/core/tasks/copy) and [clean](packages/core/tasks/clean) task

<!-- prettier-ignore -->
```js
const { copy, clean } = require('@wok-cli/core/tasks');

preset
  .set('clean')
    // task setup sub-chain
    .task(clean)
    .params({ pattern: 'public' })
  .end() // <-- return to the main chain
  .set('copy')
    .task(copy)
    .params({ src: 'static/**', dest: 'public' });
```

#### Setup Shorthand

The same code snippet above could have been written with a shorthand notation:

```js
const { copy, clean } = require('@wok-cli/core/tasks');

preset
  .set('clean', clean, { pattern: 'public' })
  .set('copy', copy, { src: 'static/**', dest: 'public' });
```

This notation is easier when you want to setup simple tasks but don't let's you easily setup advanced features like hooks ([see below](###)).

### Consuming a Preset

To convert a preset to actual gulp tasks import it, call its `resolve()` method and export the resulting object.

```js
// gulpfile.js
const $ = require('@wok-cli/core');
const myPreset = require('./configs/preset');

module.exports = myPreset($).resolve();
```

This will register two tasks `copy` and `clean`

## Setup hook plugins

Hook plugin are used inside a task to allow the user to customize task functionalities and behaviors ([see here](packages/core/create-tasks#task-function-hooks) for details).

You can setup task hooks in a preset:

<!-- prettier-ignore -->
```js
preset
  .set('copy')
    .task(copy)
    .params({ ... })
    .hooks()
      .tap('process', 'myhook', (lazypipe) => {
        return lazypipe.pipe(...);
      });
```

?> Calling `hooks` returns an instance of the [Hooks class](packages/core/api/hooks).

### Hooks Shorthand Notation

The above snippet can be written as

<!-- prettier-ignore -->
```js
preset
  .set('copy')
    .task(copy)
    .params({ ... })
    .hook('process', 'myhook', (lazypipe) => {
      return lazypipe.pipe(...);
    });
```

The main different is that while `hooks()` (without arguments) gives you access to an Hooks class instance, `hook()` will return the preset instance itself.

?> You can define global hooks (those attached to the [`$.GlobalHooks`](packages/core/configuration#globalhooks) instance) as well, by using the `globalHook` method.

## Composed Tasks

A composed task is a special task that does not have a dedicated task function but its function is the result of composing different tasks.

Usually this kind of task uses `gulp.series` or `gulp.parallel` to orchestrate other tasks.

Let's compose a `build` task executing the `clean` and `copy` tasks we previously defined.

```js
preset.task('build').compose((tasks) => {
  return gulp.series(tasks.clean, tasks.copy);
});
```

The `compose` method receives the following arguments:

| name   | type   | description                                                     |
| ------ | ------ | --------------------------------------------------------------- |
| tasks  | object | an object containing all the _normal_ tasks setup in the preset |
| config | object | the [Wok configuration object][1]                               |
| params | object | the task parameters                                             |

[1]: packages/core/configuration

## Default Task

The default task is a special kind of composed task. The main difference is that it does not have parameters.

```js
preset.default((tasks) => {
  return gulp.series(tasks.clean, tasks.copy);
});
```

!> The default task is resolved before any composed task. This means that the `tasks` argument will not contain a reference to composed tasks.

## Resolve callbacks

Resolve callbacks are function executed at the end of the `resolve()` method. You can use this feature to interact with the resolved tasks before returning them to the gulpfile:

In the following example calling `resolve()` will log all exported tasks name:

```js
preset.onResolve((tasks) => {
  const names = Object.keys(tasks).join(', ');
  console.log(`Exported tasks name: ${names}`);
});
```

## Altering a Preset

The advantage of the preset interface is that it gives you the ability to altering existing presets by modifying, adding or removing tasks, parameters and hooks.

Let's define an example preset:

<!-- prettier-ignore -->
```js
preset
  .set('clean')
    .task(clean)
    .params({ pattern: 'public' })
  .end()
  .set('copy')
    .task(copy)
    .params({ src: 'static/**', dest: 'public' })
    .hooks()
      .tap('process', 'myhook', myPlugin);
```

### Removing a task

```js
preset.delete('clean');
```

### Altering Parameters

Editing a parameter

<!-- prettier-ignore -->
```js
preset
  .get('copy')
    .params()
      .set('dest', 'build');
```

Editing multiple parameters at once

<!-- prettier-ignore -->
```js
preset
  .get('copy')
    .params({ src: 'src', dest: 'build' });
```

Other methods exposed by `.params()`:

- `delete(name)`: Deletes a parameter by name
- `get(name)`: Returns the value of a parameter by name
- `has(name)`: Returns `true` is a parameter with the given name has already been set
- `clear()`: Deletes all parameters
- `serialize()`: Returns all parameters as a key/value object

?> Refer to the [`Config` class API](packages/core/api/lib/config) for further details.

### Altering Hooks

Removing a hook function

<!-- prettier-ignore -->
```js
preset
  .get('copy')
    .hooks()
      .delete('process', 'myhook');
```

Clearing all hook functions

<!-- prettier-ignore -->
```js
preset
  .get('copy')
    .hooks()
      .delete('process');
```

Other methods exposed by `.hooks()`:

- `get(id)`: Gets all hook function for a specific hook
- `count(id)`: Returns the number hook functions added to a specific hook

?> Refer to the [`Hook` class API](packages/core/api/lib/hooks) for further details.
