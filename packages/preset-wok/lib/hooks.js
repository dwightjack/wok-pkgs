const rename = require('gulp-rename');

function stylesRename(stream, { production }) {
  if (production) {
    return stream.pipe(
      rename,
      { suffix: '.min' },
    );
  }
  return stream;
}

function babel(stream, env) {
  return stream.pipe(
    require('gulp-babel'),
    env.babel,
  );
}

module.exports = { stylesRename, babel };
