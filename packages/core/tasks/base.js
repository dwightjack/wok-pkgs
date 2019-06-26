module.exports = function baseTask(
  gulp,
  { src = [], dest = '', name = '<task>', cache = false, ...params },
  env,
  api,
) {
  const { logger, noopStream } = require('../utils');
  const folders = api.pattern(src);
  let destFolder;
  const $hooks = this.getHooks();

  try {
    destFolder = api.resolve(dest);
  } catch (e) {
    logger.error(`Destination folder not available`, e);
    return;
  }

  return Object.defineProperty(
    function base() {
      return gulp
        .src(folders, {
          dot: true,
          since: cache ? gulp.lastRun(base) : undefined,
        })
        .pipe($hooks.call('process', params['hooks:process']))
        .pipe(gulp.dest(destFolder))
        .pipe($hooks.call('complete', params['hooks:complete']))
        .pipe(noopStream()); // adds a noop stream to fix this error: https://stackoverflow.com/questions/40098156/what-about-this-combination-of-gulp-concat-and-lazypipe-is-causing-an-error-usin/40101404#40101404
    },
    'name',
    { value: name },
  );
};
