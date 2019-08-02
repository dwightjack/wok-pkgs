# View Task

Sharable tasks for rendering HTML files with external data sources.

This task uses [gulp-data](https://www.npmjs.com/package/gulp-data) to read data from external sources like JSON or YAML files.

<!-- TOC -->

- [Installation](#installation)
- [Parameters](#parameters)
- [Hooks](#hooks)
- [Example](#example)
- [Configuring a template engine](#configuring-a-template-engine)
  - [Example](#example-1)
- [Setup a data source](#setup-a-data-source)
  - [File based data source](#file-based-data-source)

<!-- /TOC -->

## Installation

```
npm i @wok-cli/task-views --save-dev
```

## Parameters

| parameter  | type               | default | note                                                |
| ---------- | ------------------ | ------- | --------------------------------------------------- |
| `src`      | string<br>string[] |         | [Globs][1] source files <sup>(1)</sup>              |
| `dest`     | string             |         | Destination folder <sup>(1)</sup>                   |
| `data`     | string<br>string[] | `''`    | [Globs][1] for external data sources <sup>(1)</sup> |
| `hook:(*)` | object             |         | Hooks configuration parameters (see below)          |

1. Supports environment templates.

[1]: https://gulpjs.com/docs/en/api/concepts#globs
[2]: https://gulpjs.com/docs/en/api/src#sourcemaps

## Hooks

| name           | type          | description                                   |
| -------------- | ------------- | --------------------------------------------- |
| `data:parsers` | Map           | a map of objects to parse files to objects    |
| `engines`      | Map           | view render engines                           |
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

To add support for a template engine use the `engines` hook and set a _render engine_.

A render engine is a function returning an object with the following properties

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
const handlebars = require('handlebars');

module.exports = createPlugin({
  name,
  plugin(engines) {
    return engines.set(name, () => {
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

const viewTask = $.task(views, {
  src: ['src/**/*.html'],
  dest: 'public',
});

+ viewTask.tap('engines', 'mustache', mustache);

exports.views = viewTask;
```

?> This example uses the `createPlugin` helper function to define a hook plugin. Read more about that function [here](#TODO).

## Setup a data source

The `data` hook exposes a promise that resolves to a list of files. These files are later processed and parsed to be used as input for [gulp-data](https://www.npmjs.com/package/gulp-data).

In addition to the usual arguments received by a hook function, a data hook function will receive as 4th argument an object with the following properties

| name      | type     | description                                                     |
| --------- | -------- | --------------------------------------------------------------- |
| `file`    | object   | [Vinyl][1] file object                                          |
| `pattern` | string[] | Glob patterns resolved from the [`data` parameter](#parameters) |

[1]: https://gulpjs.com/docs/en/api/vinyl

### File based data source

Let's implement a data source that will read a json file with the same basename of the view template.

```js
// ./sources/file.js
const { createPlugin } = require('@wok-cli/core/utils');
const fs = require('fs');
const path = require('path');
const name = 'readJSON';

module.exports = createPlugin({
  name,
  plugin(sources, env, api, params, { file }) {
    const json = file.path.replace(file.extname, '.json');

    if (!fs.existsSync(json)) {
      return sources;
    }

    return sources.then((files) => {
      const newFile = {
        id: file.stem, // a unique ID
        ext: '.json',
        contents: fs.readFileSync(json, 'utf8'),
        filepath: json,
      };
      return [...files, newFile];
    });
  },
});
```
