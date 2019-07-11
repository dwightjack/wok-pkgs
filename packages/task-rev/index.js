module.exports = function(
  gulp,
  { pattern = '', dest = '', manifest, sourcemaps = '.', ...opts },
  env,
  api,
) {
  const { logger } = require('@wok-cli/core/utils');
  const src = api.pattern(pattern).concat(['!**/*.map']);
  const dist = api.resolve(dest);
  const man = manifest && api.resolve(manifest);
  const $hooks = this.getHooks();

  function revFiles() {
    const gRev = require('gulp-rev');
    const del = require('gulp-rev-delete-original');

    const stream = gulp
      .src(src, { base: dist, sourcemaps: !!sourcemaps })
      .pipe($hooks.call('before', opts['hooks:before']))
      .pipe(gRev())
      .pipe(del())
      .pipe($hooks.call('after', opts['hooks:after']))
      .pipe(gulp.dest(dist, { sourcemaps }));

    if (man) {
      stream.pipe(gRev.manifest(man, { merge: true })).pipe(gulp.dest('.'));
    }
    return stream;
  }

  function revRewrite() {
    const rewrite = require('gulp-rev-rewrite');
    const manStream = man && gulp.src(man);
    return gulp
      .src(`${dist}/**/*.*`)
      .pipe($hooks.call('rewrite', opts['hooks:rewrite']))
      .pipe(rewrite(manStream ? { manifest: manStream } : {}))
      .pipe(gulp.dest(dist));
  }

  if (env.production && env.rev !== false) {
    return gulp.series(revFiles, revRewrite);
  }

  return function rev() {
    if (env.rev === false) {
      logger.msg('Skipping revving...');
    }
    return Promise.resolve();
  };
};
