module.exports = function sassPlugin() {
  return function sass(stream, { production, resolve }) {
    return stream.pipe(
      require('gulp-sass'),
      {
        precision: 10,
        includePaths: [resolve('<%= paths.src.vendors %>'), 'node_modules'],
        outputStyle: 'expanded',
        functions: require('./lib/functions')({
          publicPath: '/assets',
          basePath: resolve('<%= paths.src.root %>/assets'),
          production,
        }),
      },
    );
  };
};
