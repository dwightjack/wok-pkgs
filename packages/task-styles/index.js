module.exports = (gulp, { src = '', dest = '' }, env) => {
  const { resolvePatterns, resolvePath } = require('wok-core/utils');
  const srcFolder = resolvePatterns(src, env);
  const destFolder = resolvePath(dest, env);
  const { production } = env;

  return function styles() {
    return gulp
      .src(srcFolder, { sourcemaps: production })
      .pipe(env.hooks.call('copy:beforeWrite', env))
      .pipe(gulp.dest(destFolder, { sourcemaps: production && '.' }));
  };
};
