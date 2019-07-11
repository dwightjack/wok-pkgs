module.exports = function(
  gulp,
  { src = '', dest = '', sourcemaps = '.', ...params },
  env,
  api,
) {
  const srcFolder = api.pattern(src);
  const destFolder = api.resolve(dest);
  const postcssHook = require('./lib/postcss');
  const $hooks = this.getHooks();
  const { noopStream } = require('@wok-cli/core/utils');

  $hooks.tap('post', 'postcss', postcssHook);

  return function styles() {
    return gulp
      .src(srcFolder, { sourcemaps: !!sourcemaps })
      .pipe($hooks.call('pre', params['hooks:pre']))
      .pipe($hooks.call('post', params['hooks:post']))
      .pipe(gulp.dest(destFolder, { sourcemaps }))
      .pipe($hooks.call('complete', params['hooks:complete']))
      .pipe(noopStream()); // adds a noop stream to fix this error: https://stackoverflow.com/questions/40098156/what-about-this-combination-of-gulp-concat-and-lazypipe-is-causing-an-error-usin/40101404#40101404
  };
};
