const fs = require('fs');
const { promisify } = require('util');
const { parse } = require('path');
const glob = require('globby');
const readAsync = promisify(fs.readFile);
const { camelCase } = require('@wok-cli/core/utils');

/**
 * Reads and parses a list of files and returns an object with the parsed values.
 * Each object's key is a normalized reference to the filename.
 *
 * @param {string} pattern glob pattern to match files
 * @param {function} parsersMatcher Function returning a content parser object based on the input file extension
 * @param {object} env Wok env object
 * @returns {Promise<object>}
 */
module.exports = async function dataReader(pattern, parsersMatcher, env) {
  try {
    const queue = (await glob(pattern)).map(async (filepath) => {
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
