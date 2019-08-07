const fs = require('fs');
const { promisify } = require('util');
const { parse } = require('path');
const glob = require('globby');
const readAsync = promisify(fs.readFile);
const { camelCase, logger } = require('@wok-cli/core/utils');

/**
 * Reads and parses a list of files and returns an array with their contents, filepath and a normalized.
 *
 * @param {string} pattern glob pattern to match files
 * @returns {Promise<array>}
 */
module.exports = async function dataReader(pattern) {
  try {
    const queue = (await glob(pattern)).map(async (filepath) => {
      const { name, ext } = parse(filepath);
      const id = camelCase(name.toLowerCase());
      let contents = await readAsync(filepath, 'utf8');

      return { contents, filepath, ext, id };
    });
    return await Promise.all(queue);
  } catch (e) {
    logger.error(e);
    return [];
  }
};
