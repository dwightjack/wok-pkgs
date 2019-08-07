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
- [Files Array and File Object](#files-array-and-file-object)
  - [File based data source](#file-based-data-source)
  - [Pattern based data sources](#pattern-based-data-sources)
- [Parsing data sources](#parsing-data-sources)
  - [Parsing YAML Files](#parsing-yaml-files)
- [Reducing Data Sources](#reducing-data-sources)

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

| name            | type            | description                                                      |
| --------------- | --------------- | ---------------------------------------------------------------- |
| `engines`       | Map             | view render engines                                              |
| `data:fetch`    | array           | collects files from external sources                             |
| `data:parsers`  | Map             | a map of objects to parse files to objects                       |
| `data:reducers` | Promise<object> | merges parsed object files into data suitable for [gulp-data][2] |
| `post`          | [lazypipe][1]   | executed after views are rendered                                |
| `complete`      | [lazypipe][1]   | executed after views have been copied                            |

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
| `name`   | string   | engine name                                    |
| `test`   | RegExp   | a regular expression matching a file extension |
| `render` | function | render function                                |

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

The `data:fetch` hook exposes an array of files object. This array is later processed and parsed to be used as input to [gulp-data](https://www.npmjs.com/package/gulp-data).

In addition to the usual arguments received by a hook function, a data hook function will receive a 4th object argument with the following properties:

| name      | type     | description                                                     |
| --------- | -------- | --------------------------------------------------------------- |
| `file`    | object   | currently processed file as [Vinyl][1] file object              |
| `pattern` | string[] | Glob patterns resolved from the [`data` parameter](#parameters) |

[1]: https://gulpjs.com/docs/en/api/vinyl

## Files Array and File Object

A file object is a plain object with the following properties

- `id`: a unique string id for the file
- `ext`: file extension (for example `.json`)
- `contents`: file contents as string
- `filepath`: absolute path of the file

Each files array member can be:

1. a file object
1. an array of file objects
1. a promise returning one of the two previous formats

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
  plugin(files, env, api, params, { file }) {
    const json = file.path.replace(file.extname, '.json');

    if (!fs.existsSync(json)) {
      return files;
    }

    // add a new file to the files array
    files.push({
      id: file.stem,
      ext: '.json',
      contents: fs.readFileSync(json, 'utf8'),
      filepath: json,
    });

    return files;
  },
});
```

```diff
const $ = require('@wok-cli/core');
const views = require('@wok-cli/task-views');
const mustache = require('./engines/handlebars.js');
+ const readJSON = require('./sources/file.js');

const viewTask = $.task(views, {
  src: ['src/**/*.html'],
  dest: 'public',
});

viewTask.tap('engines', 'mustache', mustache);
+ viewTask.tap('data:fetch', 'readJSON', readJSON);

exports.views = viewTask;
```

### Pattern based data sources

To fetch data from a group of files you can use the built-in `fileExtract` plugin in conjunction with the `data` parameter.

As an examples let's imagine we have a `posts.json` file inside the `src/data` folder:

```json
[
  {
    "title": "My Great Post"
    // ...
  },
  {
    "title": "My Second Great Post"
    // ...
  }
]
```

Here is the changes needed to fetch those posts:

```diff
const $ = require('@wok-cli/core');
const views = require('@wok-cli/task-views');
const mustache = require('./engines/handlebars.js');
const { fileExtract } = require('@wok-cli/task-views/lib/plugins');

const viewTask = $.task(views, {
  src: ['src/**/*.html'],
  dest: 'public',
+ data: 'src/data/*.json',
});

viewTask.tap('engines', 'mustache', mustache);
+ viewTask.tap('data:fetch', 'files', fileExtract);

exports.views = viewTask;
```

The files array will contain a file object with an id `posts` and a content representing the stringified JSON.

## Parsing data sources

Once you have collected data files you might need to parse their contents in order to be readable by the view engine.

By default `task-view` parses JSON strings into JavaScript objects. If you need to support another data format you can do so by
providing a data parser.

A data parser is basically an object with two properties:

| name    | type     | description                                    |
| ------- | -------- | ---------------------------------------------- |
| `test`  | RegExp   | a regular expression matching a file extension |
| `parse` | function | parse function (either sync or async)          |

The `parse` function will receive three arguments:

- the file contents as a string
- the path to the template file
- the Wok configuration `env` object

?> If a suitable parser is not found, the raw content as a string will be passed to the view engine.

### Parsing YAML Files

As an example let's implement a YAML parser using [js-yaml](https://github.com/nodeca/js-yaml).

```js
// ./parsers/yaml.js
const yaml = require('js-yaml');
const { createPlugin } = require('@wok-cli/core/utils');

const name = 'yaml';

module.exports.json = createPlugin({
  name,
  plugin(parsers) {
    return parsers.set(name, {
      // load both .yml and .yaml files
      test: /\.ya?ml$/,
      parse: (str) => yaml.safeLoad(str),
    });
  },
});
```

## Reducing Data Sources

Reducing refers to the operation of transforming the array of parsed data files to an object suitable for [gulp-data](https://www.npmjs.com/package/gulp-data).

The default behavior
