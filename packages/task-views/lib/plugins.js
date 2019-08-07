const { createPlugin, logger } = require('@wok-cli/core/utils');
const dataReader = require('./data-reader');
const { matchParser } = require('./utils');

/**
 * Plugin to parse JSON data files
 */
module.exports.json = createPlugin({
  name: 'jsonparser',
  plugin(parsers) {
    return parsers.set('json', {
      test: /\.json$/,
      parse: (raw) => JSON.parse(raw),
    });
  },
});

/**
 * Plugin to extracts data from a glob of files
 */
const fileExtract = createPlugin({
  name: 'fileExtract',
  plugin(files, env, api, params, { pattern }) {
    if (!pattern) {
      return files;
    }

    return [...files, dataReader(pattern, env)];
  },
});

fileExtract.cache = new Map();

module.exports.fileExtract = fileExtract;

/**
 * Parses an array of files into an object.
 */
module.exports.filesToObject = createPlugin({
  name: 'filesToObject',
  async plugin(promise, env, api, params, files, parsers) {
    if (!Array.isArray(files) || files.length === 0) {
      return promise;
    }

    const matcher = matchParser(parsers);

    try {
      const parseJobs = files.map(async ({ id, contents, filepath, ext }) => {
        const parser = matcher(ext);
        let ret = contents;
        if (parser) {
          ret = await parser.parse(contents, filepath, env);
        }
        return { [id]: ret };
      });

      const acc = await promise;
      const parsedFiles = await Promise.all(parseJobs);

      if (params.namespace) {
        acc[params.namespace] = Object.assign(...parsedFiles);
        return acc;
      }

      return Object.assign(acc, ...parsedFiles);
    } catch (e) {
      logger.error(e);
      return {};
    }
  },
});
