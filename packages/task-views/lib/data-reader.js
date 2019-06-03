const fs = require('fs');
const { promisify } = require('util');
const { parse } = require('path');
const glob = require('globby');
const readAsync = promisify(fs.readFile);
const { camelCase } = require('wok-core/utils');

module.exports = async function dataReader(dataPatter, parsersMatcher, env) {
  try {
    const queue = (await glob(dataPatter)).map(async (filepath) => {
      const { name, ext } = parse(filepath);
      const id = camelCase(name.toLowerCase());
      let contents = await readAsync(filepath, 'utf8');

      const parser = parsersMatcher(ext);
      if (parser) {
        contents = await parser.parse(contents, filepath, env);
      }
      return { [id]: contents };
    });
    const fragments = await Promise.all(queue);
    return Object.assign({}, ...fragments);
  } catch (e) {
    console.error(e);
    return {};
  }
};
