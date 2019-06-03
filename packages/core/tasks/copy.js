module.exports = (gulp, { pattern = [], dest = '' }, env) => {
  const size = require('gulp-size');
  const { logger, noopStream } = require('../utils');
  const folders = env.pattern(pattern);
  let destFolder;

  try {
    destFolder = env.resolve(dest);
  } catch (e) {
    logger.error(`Destination folder not available`, e);
    return;
  }

  return function copy() {
    return gulp
      .src(folders, {
        dot: true,
        since: gulp.lastRun(copy),
      })
      .pipe(env.hooks.call('copy:beforeWrite', env))
      .pipe(size({ title: 'Copy' }))
      .pipe(gulp.dest(destFolder))
      .pipe(env.hooks.call('copy:complete', env))
      .pipe(noopStream()); // adds a noop stream to fix this error: https://stackoverflow.com/questions/40098156/what-about-this-combination-of-gulp-concat-and-lazypipe-is-causing-an-error-usin/40101404#40101404
  };
};
