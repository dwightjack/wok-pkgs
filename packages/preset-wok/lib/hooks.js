const rename = require('gulp-rename');
const { noopStream } = require('wok-core/utils');

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

function eslint(stream, env) {
  if (!env.lint) {
    return stream;
  }
  const glint = require('gulp-eslint');
  return stream
    .pipe(
      glint,
      env.eslint,
    )
    .pipe(glint.format)
    .pipe(env.production ? glint.failAfterError : noopStream);
}

function stylelint(stream, env) {
  if (!env.lint) {
    return stream;
  }
  return stream.pipe(
    require('gulp-stylelint'),
    env.stylelint || {
      reporters: [{ formatter: 'string', console: true }],
    },
  );
}
module.exports = { stylesRename, babel, eslint, stylelint };
