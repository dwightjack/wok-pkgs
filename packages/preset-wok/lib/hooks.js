const rename = require('gulp-rename');

function stylesRename(stream, env) {
  if (env.production) {
    return stream.pipe(
      rename,
      { suffix: '.min' },
    );
  }
  return stream;
}

function babel(stream, { babel }) {
  return stream.pipe(
    require('gulp-babel'),
    babel,
  );
}

module.exports = { stylesRename, babel };
