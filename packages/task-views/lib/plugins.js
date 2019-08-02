const { createPlugin } = require('@wok-cli/core/utils');
const dataReader = require('./data-reader');

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
