# View Task

Sharable tasks for rendering HTML files with external data sources.

This task uses [gulp-data](https://www.npmjs.com/package/gulp-data) to read data from external sources like JSON or YAML files.

## Installation

```
npm i @wok-cli/task-views --save-dev
```

## Parameters

| parameter  | type               | default | note                                                |
| ---------- | ------------------ | ------- | --------------------------------------------------- |
| `src`      | string<br>string[] |         | [Globs][1] source files <sup>(1)</sup>              |
| `dest`     | string             |         | Destination folder <sup>(1)</sup>                   |
| `data`     | string             | `''`    | [Globs][1] for external data sources <sup>(1)</sup> |
| `hook:(*)` | object             |         | Hooks configuration parameters (see below)          |

1. Supports environment templates.

[1]: https://gulpjs.com/docs/en/api/concepts#globs
[2]: https://gulpjs.com/docs/en/api/src#sourcemaps

## Hooks

| name           | type          | description                                   |
| -------------- | ------------- | --------------------------------------------- |
| `data:parsers` | Map           | a map of objects to parse files to objects    |
| `engines`      | Map           | view rendering engines                        |
| `data`         | Promise       | external data object passed to [gulp-data][2] |
| `post`         | [lazypipe][1] | executed after views are rendered             |
| `complete`     | [lazypipe][1] | executed after views have been copied         |

[1]: https://github.com/OverZealous/lazypipe
[2]: https://www.npmjs.com/package/gulp-data

## Example

```js
const $ = require('@wok-cli/core');
const views = require('@wok-cli/task-views');

const viewTask = $.task(views, {
  src: ['src/**/*.html'],
  dest: 'public',
});

exports.views = viewTask;
```

## Configuring a template engine

To add support for a template engine use the `engines` map hook and set a _view engine_.

A view engine is a function returning an object with the following properties

| name     | type     | description                                    |
| -------- | -------- | ---------------------------------------------- |
| `name`   | String   | engine name                                    |
| `test`   | RegExp   | a regular expression matching a file extension |
| `render` | Function | render function                                |

The `render` function will receive three arguments:

- the template contents as a string
- an object with optional data collected from external data sources.
- the path to the template file

### Example

Let's implement a render engine to support [handlebars](https://handlebarsjs.com/) templates.

```js
// ./engines/handlebars.js
const { createPlugin } = require('@wok-cli/core/utils');
const name = 'handlebars';
const handlebars = require();

module.exports = createPlugin({
  name,
  plugin(engines) {
    engines.set(name, () => {
      return {
        name,
        test: /\.hbs$/,
        render(tmpl, data) {
          return Handlebars.compile(tmpl)(data);
        },
      };
    });
  },
});
```

```diff
const $ = require('@wok-cli/core');
const views = require('@wok-cli/task-views');
+ const mustache = require('./engines/handlebars.js');

const ViewTask = $.task(views, {
  src: ['src/**/*.html'],
  dest: 'public',
});

+ ViewTask.tap('engines', 'mustache', mustache);

exports.views = viewTask;
```

?> This example uses the `createPlugin` helper function to define a hook plugin. Read more about that function [here](#TODO).
