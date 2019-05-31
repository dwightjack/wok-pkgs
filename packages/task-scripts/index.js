module.exports = (gulp, { src = '', dest = '' }, env) => {
  const { resolvePatterns, resolvePath } = require('wok-core/utils');
  const srcFolder = resolvePatterns(src, env);
  const destFolder = resolvePath(dest, env);
  const { production, hooks } = env;

  return function scripts() {
    return gulp
      .src(srcFolder, { sourcemaps: production })
      .pipe(hooks.call('scripts:transform', env))
      .pipe(hooks.call('scripts:post', env))
      .pipe(gulp.dest(destFolder, { sourcemaps: production && '.' }));
  };
};
