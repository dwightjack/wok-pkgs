const { createPlugin } = require('@wok-cli/core/utils');
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
 * Plugin to extracts and parses data from files matching a glob pattern
 */
module.exports.fileExtract = createPlugin({
  name: 'fileExtract',
  plugin(promise, env, api, params, { pattern, parsers = new Map() }) {
    if (!pattern) {
      return promise;
    }

    let reader;
    return promise.then((data) => {
      if (!reader) {
        reader = dataReader(pattern, matchParser(parsers), env).then((v) =>
          Object.assign(data, v),
        );
      }
      return reader;
    });
  },
});
