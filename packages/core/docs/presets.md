# Presets

Presets let you setup pre-defined tasks, parameters and hooks with a chainable API and export it for usage in your projects.

<!-- TOC -->

- [Getting started](#getting-started)
  - [Task Setup](#task-setup)
    - [Setup Shorthand](#setup-shorthand)
  - [Consuming a Preset](#consuming-a-preset)
- [Setup hook plugins](#setup-hook-plugins)
  - [Hooks Shorthand Notation](#hooks-shorthand-notation)
  - [Global Hooks](#global-hooks)
- [Composed Tasks](#composed-tasks)
- [Private Tasks](#private-tasks)
- [Default Task](#default-task)
- [Resolve callbacks](#resolve-callbacks)
- [Altering a Preset](#altering-a-preset)
  - [Removing a task](#removing-a-task)
  - [Altering Parameters](#altering-parameters)
  - [Altering Hooks](#altering-hooks)

<!-- /TOC -->

## Getting started

A preset is defined as a module exporting a function. The function will receive a [configuration object](packages/core/configuration).

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

Let's setup a copy and clean task based on the Wok [copy](packages/tasks/copy) and [clean](packages/tasks/clean) tasks.

<!-- prettier-ignore -->
```js
const { copy, clean } = require('@wok-cli/tasks');

preset
  .set('clean') // 1. set the task name
    // 2. task setup sub-chain
    .task(clean) // 3. task creator function
    .params({ pattern: 'public' }) // 4. task parameters
  .end() // 5. return to the main chain
  .set('copy')
    .task(copy)
    .params({ src: 'static/**', dest: 'public' });
```

#### Setup Shorthand

The same code snippet above could have been written with the shorthand notation:

```js
const { copy, clean } = require('@wok-cli/core/tasks');

preset
  .set('clean', clean, { pattern: 'public' })
  .set('copy', copy, { src: 'static/**', dest: 'public' });
```

This notation is easier when you want to setup simple tasks. Anyway it doesn't let you easily setup advanced features like hooks ([see below](#setup-hook-plugins)).

### Consuming a Preset

To convert a preset to exportable gulp tasks import it, call its `resolve()` method and export the resulting object.

```js
// gulpfile.js
const $ = require('@wok-cli/core');
const myPreset = require('./configs/preset');

module.exports = myPreset($).resolve();
```

This will register two tasks `copy` and `clean`

## Setup hook plugins

Hook plugins are used inside a task to allow the user to customize task's functionalities and behaviors ([see here](packages/core/create-tasks#task-function-hooks) for details).

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
      })
    .end();  // <-- return to the task chain
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

The main different is that while `hooks()` (without arguments) gives you access to an Hooks class instance, `hook()` will return the task chain itself.

### Global Hooks

You can define global hooks (those attached to the [`$.GlobalHooks`](packages/core/configuration#globalhooks) instance) as well, by using the `globalHook` method:

<!-- prettier-ignore -->
```js
preset
  .globalHooks('scripts', 'hookname', ...)
```

## Composed Tasks

A composed task is a special task that does not have a dedicated task function but its function is the result of composing different tasks.

Usually this kind of task uses `gulp.series` or `gulp.parallel` to orchestrate other tasks.

Let's compose a `build` task executing the `clean` and `copy` tasks we previously defined.

<!-- prettier-ignore -->
```js
preset
  .set('build')
    .compose((tasks) => {
      return gulp.series(tasks.clean, tasks.copy);
    });
```

The `compose` method receives the following arguments:

| name   | type   | description                                                                       |
| ------ | ------ | --------------------------------------------------------------------------------- |
| tasks  | object | An object containing all the previously defined tasks (both normal and composed). |
| config | object | The [Wok configuration object][1].                                                |
| params | object | The task parameters set via the `params` method.                                  |

[1]: packages/core/configuration

## Private Tasks

A private task is a task that will not be directly callable by the user. It can be used as part of composed tasks.

By default all tasks with a name starting with `$` are considered private. In alternative you can use the `.private(true|false)` method to toggle a task visibility status.

Let's extend the previous example with a greeting and the beginning of the build process:

<!-- prettier-ignore -->
```js
preset
  .set('$greet')
    .compose(() => {
      console.log('Hello!');
      return Promise.resolve();
    });

preset
  .set('build')
    .compose((tasks) => {
      return gulp.series(
        tasks.$greet, 
        tasks.clean, 
        tasks.copy
      );
    });
```

The user will be greeted when running `gulp build` but won't be able to run `gulp $greet` directly.

The same example could be written as:

<!-- prettier-ignore -->
```js
preset
  .set('greet')
    .private(true) // make the task private
    .compose(() => {
      console.log('Hello!');
      return Promise.resolve();
    });

preset
  .set('build')
    .compose((tasks) => {
      return gulp.series(
        tasks.greet, 
        tasks.clean, 
        tasks.copy
      );
    });
```

## Default Task

The default task is a special kind of composed task. The main difference is that it does not have parameters.

```js
preset.default((tasks) => {
  return gulp.series(tasks.clean, tasks.copy);
});
```

!> The default task is resolved before any composed task. This means that the `tasks` argument will not contain a reference to composed tasks even if defined _before_ it.

## Resolve callbacks

Resolve callbacks are function executed at the end of the `resolve()` method. You can use this feature to interact with the resolved tasks before returning them to the gulpfile:

In the following example calling `resolve()` will log all exported tasks name:

```js
preset.onResolve((tasks) => {
  const names = Object.keys(tasks).join(', ');
  console.log(`Exported tasks name: ${names}`);
});
```

!> The `tasks` parameter of `onResolve` does not contain a reference to private tasks.

## Altering a Preset

The advantage of the preset interface is that it gives you the ability to alter existing presets by modifying, adding or removing tasks, parameters, and hooks.

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

?> Refer to the [`Config` class API](packages/core/api/config) for further details.

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

?> Refer to the [`Hook` class API](packages/core/api/hooks) for further details.
