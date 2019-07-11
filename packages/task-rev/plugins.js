const { createPlugin } = require('@wok-cli/core/utils');
const rev = require('gulp-rev');

module.exports.apply = createPlugin({
  name: 'rev:apply',
  productionOnly: true,
  plugin: (stream) => stream.pipe(rev),
});

module.exports.write = createPlugin({
  name: 'rev:write',
  productionOnly: true,
  plugin(stream, env, api, { manifest }) {
    return stream
      .pipe(
        rev.manifest,
        api.resolve(manifest),
        { merge: true },
      )
      .pipe(
        api.dest,
        '.',
      );
  },
});
