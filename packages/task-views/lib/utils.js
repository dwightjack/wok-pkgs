const { logger } = require('@wok-cli/core/utils');

/**
 * Returns a function to retrieve a parser object
 * matching a file extension with the `test` regexp of the parser
 *
 * @param {Map<string,object>} parsersMap Map of parsers
 * @returns {function}
 */
function matchParser(parsersMap) {
  const parsers = [...parsersMap.values()];
  return (ext) => parsers.find((p) => p.test.test(ext));
}

/**
 * Returns a function to match a view render engine based on a file extension.
 *
 * @param {Map<string,function>} engines Render engines
 * @returns {function}
 */
function matchEngine(engines) {
  const arr = [...engines.values()].map((createRenderer) => createRenderer());
  return (ext) => arr.find((p) => p.test.test(ext));
}

/**
 * Parses an array of files to an object.
 *
 * @param {object[]} files Array of files.
 * @param {Map<string,object>} parsersMap Map of parsers
 * @param {object} env Wok env configuration object
 * @returns {object}
 */
async function filesToData(files, parsersMap, env) {
  const matcher = matchParser(parsersMap);

  try {
    const parseJobs = files.map(async ({ id, contents, filepath, ext }) => {
      const parser = matcher(ext);
      let ret = contents;
      if (parser) {
        ret = await parser.parse(contents, filepath, env);
      }
      return { [id]: ret };
    });

    const parsedFiles = await Promise.all(parseJobs);

    return Object.assign(...parsedFiles);
  } catch (e) {
    logger.error(e);
    return {};
  }
}

module.exports = { matchParser, matchEngine, filesToData };
