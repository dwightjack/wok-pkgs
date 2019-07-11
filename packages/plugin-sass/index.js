const fns = require('./lib/functions');
const { createPlugin } = require('@wok-cli/core/utils');

function sass(stream, env, api, opts) {
  const { includePaths = ['node_modules'], functions, ...options } = opts;

  return stream.pipe(
    require('gulp-sass'),
    {
      precision: 10,
      includePaths: api.pattern(includePaths),
      outputStyle: 'expanded',
      functions: (functions || fns)(env, api, options),
      ...options,
    },
  );
}

module.exports = createPlugin({
  name: 'sass',
  plugin: sass,
});
