module.exports = function sassPlugin() {
  const { resolvePath } = require('wok-core/utils');
  return function sass(stream, env) {
    return stream.pipe(
      require('gulp-sass'),
      {
        precision: 10,
        includePaths: [
          resolvePath('<%= paths.src.vendors %>', env),
          'node_modules',
        ],
        outputStyle: 'expanded',
        functions: require('./lib/functions')({
          publicPath: '/assets',
          basePath: resolvePath('<%= paths.src.root %>/assets', env),
          production: env.production,
        }),
      },
    );
  };
};
