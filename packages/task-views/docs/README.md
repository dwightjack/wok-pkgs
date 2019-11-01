# View Task

Sharable tasks for rendering HTML files with external data sources.

This task uses [gulp-data](https://www.npmjs.com/package/gulp-data) to read data from external sources like JSON or YAML files.

<!-- TOC -->

- [Installation](#installation)
- [Environmental variables](#environmental-variables)
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

This task requires `@wok-cli/core` as peer dependency.

```
npm i @wok-cli/core @wok-cli/task-views --save-dev
```

## Environmental variables

This task adds the following [environmental variables](packages/core/configuration#env):

- `views`: (object) configuration object with the following properties:
  - `outputExt`: (string) Rendered file extension (defaults to `.html`)

## Parameters

| parameter  | type               | default | note                                                |
| ---------- | ------------------ | ------- | --------------------------------------------------- |
| `src`      | string<br>string[] |         | [Globs][1] source files <sup>(1)</sup>              |
| `dest`     | string             |         | Destination folder <sup>(1)</sup>                   |
| `data`     | string<br>string[] | `''`    | [Globs][1] for external data sources <sup>(1)</sup> |
| `hook:(*)` | object             |         | Hooks configuration parameters (see below)          |

1. _Supports environment templates._

[1]: https://gulpjs.com/docs/en/api/concepts#globs
[2]: https://gulpjs.com/docs/en/api/src#sourcemaps

## Hooks

| name            | type            | description                                                      |
| --------------- | --------------- | ---------------------------------------------------------------- |
| `engines`       | Map             | render engines                                                   |
| `data:fetch`    | array           | Collects files from external sources                             |
| `data:parsers`  | Map             | Files to objects parsers                                         |
| `data:reducers` | Promise<object> | Merges parsed object files into data suitable for [gulp-data][3] |
| `post`          | [lazypipe][4]   | Executed after views are rendered                                |
| `complete`      | [lazypipe][4]   | Executed after files have been written to disk                   |

[3]: https://github.com/OverZealous/lazypipe
[4]: https://www.npmjs.com/package/gulp-data

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

To add support for a template engine use the `engines` hook and set a **render engine**.

A render engine is a function returning an object with the following properties

| name     | type     | description                                    |
| -------- | -------- | ---------------------------------------------- |
| `name`   | string   | engine name                                    |
| `test`   | RegExp   | a regular expression matching a file extension |
| `render` | function | render function                                |

The `render` function will receive three arguments:

- the template contents as a string.
- an object with optional data collected from [external data sources](#setup-a-data-source).
- the path to the template file.

?> The object data exposes a special `PRODUCTION` flag that reflects the `production` property of Wok [`$.env`](https://dwightjack.github.io/wok-pkgs/#/packages/core/configuration?id=env) object.

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
+ const handlebars = require('./engines/handlebars.js');

const viewTask = $.task(views, {
- src: ['src/**/*.html'],
+  src: ['src/**/*.{hbs,html}'],
  dest: 'public',
});

+ viewTask.tap('engines', 'handlebars', handlebars);

exports.views = viewTask;
```

?> This example uses the `createPlugin` helper function to define a hook plugin. Read more about that function [here](https://dwightjack.github.io/wok-pkgs/#/packages/core/create-tasks?id=task-plugins).

## Setup a data source

The `data:fetch` hook exposes an array of files object. This array is later processed and parsed to be used as input to [gulp-data](https://www.npmjs.com/package/gulp-data).

In addition to the usual arguments received by a hook function, a data hook function will receive a 4th object argument with the following properties:

| name      | type     | description                                                     |
| --------- | -------- | --------------------------------------------------------------- |
| `file`    | object   | currently processed file as [Vinyl][5] file object              |
| `pattern` | string[] | Glob patterns resolved from the [`data` parameter](#parameters) |

[5]: https://gulpjs.com/docs/en/api/vinyl

### Files Array and File Object

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
    // `file` is a Vinyl file object
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
const handlebars = require('./engines/handlebars.js');
+ const readJSON = require('./sources/file.js');

const viewTask = $.task(views, {
  src: ['src/**/*.{html,hbs}'],
  dest: 'public',
});

viewTask.tap('engines', 'handlebars', handlebars);
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
const handlebars = require('./engines/handlebars.js');
+ const { fileExtract } = require('@wok-cli/task-views/lib/plugins');

const viewTask = $.task(views, {
  src: ['src/**/*.{html,hbs}'],
  dest: 'public',
+ data: 'src/data/*.json',
});

viewTask.tap('engines', 'handlebars', handlebars);
+ viewTask.tap('data:fetch', 'files', fileExtract);

exports.views = viewTask;
```

The files array will contain a file object with an id `posts` and a content representing the stringified JSON.

## Parsing data sources

Once you have collected data files you might need to parse their contents in order to be readable by the view engine.

By default, `@wok-cli/task-views` parses JSON strings into JavaScript objects. If you need to support another data format you can do so by
providing a **data parser**.

A data parser is an object with two properties:

| name    | type     | description                                    |
| ------- | -------- | ---------------------------------------------- |
| `test`  | RegExp   | A regular expression matching a file extension |
| `parse` | function | Parse function (either sync or async)          |

The `parse` function will receive three arguments:

- the file contents as a string
- the path to the data source file
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

_Reducing_ refers to the operation of transforming the array of parsed data files into an object suitable for [gulp-data](https://www.npmjs.com/package/gulp-data).

The default behavior provided by the build-in `filesToObject` plugin is to transform the files into an object with keys represented by the normalized filename and values generated from parsed contents.

Looking at a [previous example](#parsing-data-sources) the object passed into gulp-data will look like:

```
{
  posts: [
    {
      title: 'My Great Post',
      // ...
    },
    {
      title: 'My Second Great Post',
      // ...
    },
  ]
}
```

You can move collected data under a namespace by setting the `hooks:data:reducers -> filesToObject -> namepace` configuration property:

```diff
// ...

const viewTask = $.task(views, {
  src: ['src/**/*.{html,hbs}'],
  dest: 'public',
  data: 'src/data/*.json',
+ 'hooks:data:reducers': {
+   filesToObject: {
+     namespace: 'data'
+   }
+ },
});

// ...

exports.views = viewTask;
```

This will lead to the following data structure:

```
{
  data: { <-- added namespace
    posts: [
      {
        title: 'My Great Post',
        // ...
      },
      {
        title: 'My Second Great Post',
        // ...
      },
    ]
  }
}
```
