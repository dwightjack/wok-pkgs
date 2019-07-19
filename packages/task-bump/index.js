/**
 * Sharable Bump Task
 *
 * @param {Gulp} gulp Gulp instance
 * @param {object} params Task parameters
 * @param {string|string[]} [params.src=['package.json']] Source globs
 * @param {string} [params.dest='./'] Destination folder
 * @param {object} env Wok environment object
 * @param {object} api Wok API object
 * @returns {function} Gulp tasks
 */
module.exports = (gulp, { src = ['package.json'], dest = './' }, env, api) => {
  const { pkg, argv } = env;

  return async function bump() {
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
        .src(api.pattern(src))
        .pipe(gulpBump({ type }))
        .pipe(gulp.dest(api.resolve(dest)))
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
