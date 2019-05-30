const rename = require('gulp-rename');
const { resolvePath } = require('wok-core/utils');

function sass(stream, env) {
  return stream.pipe(
    require('gulp-sass'),
    {
      precision: 10,
      includePaths: [
        resolvePath('<%= paths.src.vendors %>', env),
        'node_modules',
      ],
      outputStyle: 'expanded',
      functions: require('./sass-functions')({
        publicPath: '/assets',
        basePath: resolvePath('<%= paths.src.root %>/assets', env),
        production: env.production,
      }),
    },
  );
}

function stylesRename(stream, env) {
  if (env.production) {
    return stream.pipe(
      rename,
      { suffix: '.min' },
    );
  }
  return stream;
}

module.exports = { sass, stylesRename };
