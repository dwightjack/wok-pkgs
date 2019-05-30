module.exports = ({ manifest = '' } = {}) => {
  const { resolveTemplate } = require('wok-core/utils');
  const { dest } = require('gulp');
  const rev = require('gulp-rev');

  return {
    apply(lazypipe, env) {
      if (!env.production) {
        return lazypipe;
      }
      return lazypipe.pipe(rev);
    },
    write(lazypipe, env) {
      if (!env.production) {
        return lazypipe;
      }
      return lazypipe
        .pipe(
          rev.manifest,
          resolveTemplate(manifest, env),
          { merge: true },
        )
        .pipe(
          dest,
          '.',
        );
    },
  };
};
