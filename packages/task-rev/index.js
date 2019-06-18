module.exports = (
  gulp,
  { pattern = '', dest = '', manifest, ...opts },
  env,
  api,
) => {
  const gRev = require('gulp-rev');
  const del = require('gulp-rev-delete-original');
  const rewrite = require('gulp-rev-rewrite');
  const { logger } = require('wok-core/utils');
  const src = api.pattern(pattern);
  const dist = api.resolve(dest);
  const man = manifest && api.resolve(manifest);

  function revFiles() {
    return gulp
      .src(src, { base: dist, sourcemaps: true })
      .pipe(api.hooks.call('rev:before', opts['hooks:before']))
      .pipe(gRev())
      .pipe(del())
      .pipe(api.hooks.call('rev:after', opts['hooks:after']))
      .pipe(gulp.dest(dist))
      .pipe(gRev.manifest(man, { merge: true }))
      .pipe(gulp.dest('.', { sourcemaps: '.' }));
  }

  function revRewrite() {
    const manStream = gulp.src(man);
    return gulp
      .src(`${dist}/**/*.*`)
      .pipe(api.hooks.call('rev:rewrite', opts['hooks:rewrite']))
      .pipe(rewrite({ manifest: manStream }))
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
