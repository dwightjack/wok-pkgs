module.exports = ({ manifest = '' } = {}) => {
  const { resolveTemplate } = require('wok-core/utils');
  const rev = require('gulp-rev');

  return {
    apply(stream, env) {
      if (!env.production) {
        return stream;
      }
      return stream.pipe(rev());
    },
    write(stream, env) {
      if (!env.production) {
        return stream;
      }
      return stream.pipe(
        rev.manifest({ merge: true, path: resolveTemplate(manifest, env) }),
      );
    },
  };
};
