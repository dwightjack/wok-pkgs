/**
 * Sharable tasks for rendering HTML views.
 *
 * The `params` object accepts the following hook configuration keys:
 *
 * - `hooks:data:parsers` parameters passed to the `data:parsers` hook
 * - `hooks:data` parameters passed to the `data` hook
 * - `hooks:engines` parameters passed to the `engines` hook
 * - `hooks:post` parameters passed to the `post` hook
 * - `hooks:complete` parameters passed to the `complete` hook
 *
 * @param {Gulp} gulp Gulp instance
 * @param {object} params Task parameters
 * @param {string|string[]} params.src Source globs
 * @param {string} params.dest Destination folder
 * @param {string} [params.data=''] External data sources glob pattern
 * @param {object} env Wok environment object
 * @param {object} api Wok API object
 * @returns {function} Gulp tasks
 */
module.exports = function(
  gulp,
  { src = '', dest = '', data = '', ...params },
  env,
  api,
) {
  const { extname } = require('path');
  const { map, noopStream } = require('@wok-cli/core/utils');
  const { json, fileExtract } = require('./lib/plugins');
  const { matchEngine } = require('./lib/utils');
  const srcFolder = api.pattern(src);
  const destFolder = api.resolve(dest);
  const { production } = env;
  const $hooks = this.getHooks();

  $hooks.tap('data:parsers', 'json', json);
  $hooks.tap('data', 'fileExtract', fileExtract);

  return function views() {
    const rename = require('gulp-rename');
    const gulpData = require('gulp-data');

    const parsers = $hooks.callWith(
      'data:parsers',
      new Map(),
      params['hooks:data:parsers'],
    );

    const engineMatcher = matchEngine(
      $hooks.callWith('engines', new Map(), params['hooks:engines']),
    );

    return gulp
      .src(srcFolder)
      .pipe(
        gulpData((file) =>
          $hooks.callWith('data', Promise.resolve({}), params['hooks:data'], {
            file,
            pattern: data && api.pattern(data),
            parsers,
          }),
        ),
      )
      .pipe(
        map((code, filepath, { data = {} }) => {
          const engine = engineMatcher(extname(filepath));
          if (engine) {
            return engine.render(
              code,
              Object.assign(
                {
                  PRODUCTION: production,
                  page: {},
                },
                data,
              ),
              filepath,
            );
          }
          return code;
        }),
      )
      .pipe(
        rename({
          extname: (env.views && env.views.outputExt) || '.html',
        }),
      )
      .pipe($hooks.call('post', params['hooks:post']))
      .pipe(gulp.dest(destFolder))
      .pipe($hooks.call('complete', params['hooks:complete']))
      .pipe(noopStream()); // adds a noop stream to fix this error: https://stackoverflow.com/questions/40098156/what-about-this-combination-of-gulp-concat-and-lazypipe-is-causing-an-error-usin/40101404#40101404
  };
};
