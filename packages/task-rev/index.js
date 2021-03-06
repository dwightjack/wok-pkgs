/**
 * Sharable File Revving Task
 *
 * The `params` object accepts the following hook configuration keys:
 *
 * - `hooks:before` parameters passed to the `before` hook
 * - `hooks:after` parameters passed to the `after` hook
 *
 * @param {Gulp} gulp Gulp instance
 * @param {object} params Task parameters
 * @param {string|string[]} params.pattern Source globs
 * @param {string} params.dest Revved file destination folder
 * @param {string} [params.manifest] Optional file path of an [asset manifest](https://github.com/sindresorhus/gulp-rev#asset-manifest)
 * @param {object} env Wok environment object
 * @param {object} api Wok API object
 * @returns {function} Gulp tasks
 */

module.exports = function(
  gulp,
  { pattern = '', dest = '', manifest, ...opts },
  env,
  api,
) {
  const { logger } = require('@wok-cli/core/utils');
  const src = api.pattern(pattern);
  const dist = api.resolve(dest);
  const man = manifest && api.resolve(manifest);
  const $hooks = this.getHooks();

  function revFiles() {
    const gRev = require('gulp-rev');
    const del = require('gulp-rev-delete-original');

    let stream = gulp
      .src(src, { base: dist })
      .pipe($hooks.call('before', opts['hooks:before']))
      .pipe(gRev())
      .pipe(del())
      .pipe($hooks.call('after', opts['hooks:after']))
      .pipe(gulp.dest(dist));

    if (man) {
      stream = stream
        .pipe(gRev.manifest(man, { merge: true }))
        .pipe(gulp.dest('.'));
    }
    return stream;
  }

  function revRewrite() {
    const rewrite = require('gulp-rev-rewrite');
    const manStream = man && gulp.src(man);
    const filter = require('gulp-filter');
    const binaryExt = require('binary-extensions');

    const isNotBinary = filter(
      (file) =>
        binaryExt.includes(file.extname.slice(1).toLowerCase()) === false,
    );

    return gulp
      .src(`${dist}/**/*.*`)
      .pipe(isNotBinary)
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
