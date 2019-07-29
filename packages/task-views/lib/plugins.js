const { createPlugin } = require('@wok-cli/core/utils');
const dataReader = require('./data-reader');
const { matchParser } = require('./utils');

module.exports.json = createPlugin({
  name: 'jsonparser',
  plugin(parsers) {
    return parsers.set('json', {
      test: /\.json$/,
      parse: (raw) => JSON.parse(raw),
    });
  },
});

module.exports.dataExtract = createPlugin({
  name: 'global',
  plugin(stream, env, api, params, dataPatter, parsers = []) {
    const readerPromise = dataReader(dataPatter, matchParser(parsers), env);
    return stream.pipe(
      require('gulp-data'),
      () => readerPromise,
    );
  },
});
