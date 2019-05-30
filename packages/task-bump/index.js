module.exports = (gulp, { src = ['package.json'], dest = './' }, env) => {
  const { pkg, argv } = env;

  return async function bump() {
    const { resolvePatterns, resolvePath } = require('wok-core/utils');
    const semver = require('semver');
    const gulpBump = require('gulp-bump');
    const prompts = require('prompts');
    const allowed = ['major', 'minor', 'patch'];
    let { type } = argv;

    //if --type is set and valid, use it
    if (semver.inc(pkg.version, type) === null) {
      type = await prompts([
        {
          name: 'type',
          type: 'select',
          message: 'New version number?',
          initial: allowed.indexOf('patch'),
          choices: allowed.map((value) => ({
            title: `${value} (${semver.inc(pkg.version, value)})`,
            value,
          })),
        },
      ]);
    }
    if (!type) {
      throw new Error(`Provided version bump is not valid: ${type}`);
    }

    return new Promise((resolve, reject) => {
      gulp
        .src(resolvePatterns(src, env))
        .pipe(gulpBump({ type }))
        .pipe(gulp.dest(resolvePath(dest, env)))
        .on('end', (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
    });
  };
};
