const { createPlugin } = require('@wok-cli/core/utils');
const dataReader = require('./data-reader');

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
  plugin(stream, env, api, params, dataPatter, parsersMatcher) {
    const readerPromise = dataReader(dataPatter, parsersMatcher, env);
    return stream.pipe(
      require('gulp-data'),
      () => readerPromise,
    );
  },
});
