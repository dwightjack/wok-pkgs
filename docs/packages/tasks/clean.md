# Clean Task

Deletes folders and files. Uses [del](https://www.npmjs.com/package/del) under the hood.

By default this task will delete all files including those starting with a `.`.

## Parameters

| parameter | type               | note                                                                                                             |
| --------- | ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `pattern` | string<br>string[] | [Globs][1] files to delete <sup>(1)</sup>                                                                        |
| `*`       |                    | Any other parameter will be passed to `del` as configuration [option](https://www.npmjs.com/package/del#options) |

1. _Supports environment templates._

[1]: https://gulpjs.com/docs/en/api/concepts#globs

## Hooks

This task does not expose any hook

## Example

```js
const $ = require('@wok-cli/core');
const { clean } = require('@wok-cli/tasks');

exports.copy = $.task(clean, {
  pattern: ['dist'],
});
```
