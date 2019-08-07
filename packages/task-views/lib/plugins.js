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
module.exports.fileExtract = createPlugin({
  name: 'fileExtract',
  plugin(sources, env, api, params, { pattern }) {
    if (!pattern) {
      return sources;
    }

    let reader;
    return sources.then((files) => {
      if (!reader) {
        reader = dataReader(pattern, env).then((f) => files.concat(f));
      }
      return reader;
    });
  },
});

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

      if (params.key) {
        acc[params.key] = Object.assign(...parsedFiles);
        return acc;
      }

      return Object.assign(acc, ...parsedFiles);
    } catch (e) {
      logger.error(e);
      return {};
    }
  },
});
