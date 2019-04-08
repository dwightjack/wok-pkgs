module.exports = (gulp, { pattern = [], dest = '' }, env) => {
  const size = require('gulp-size');
  const { SyncWaterfallHook } = require('tapable');
  const identity = require('lodash/identity');
  const { resolvePatterns, resolveTemplate, logger } = require('../utils');
  const folders = resolvePatterns(pattern, env);
  let destFolder;

  try {
    destFolder = resolveTemplate(dest, env);
  } catch (e) {
    logger.error(`Destination folder not available`, e);
    return;
  }

  const before = new SyncWaterfallHook(['stream', 'env']);
  const after = new SyncWaterfallHook(['stream', 'env']);

  before.tap('default', identity);
  after.tap('default', identity);

  function copy() {
    const stream = gulp.src(folders, {
      dot: true,
      since: gulp.lastRun(copy),
    });

    const result = before
      .call(stream, env)
      .pipe(size({ title: 'Copy' }))
      .pipe(gulp.dest(destFolder));

    return after.call(result, env);
  }

  copy.hooks = { after, before };

  return copy;
};
