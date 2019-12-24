/**
 * Sharable tasks for rendering HTML views.
 *
 * The `params` object accepts the following hook configuration keys:
 *
 * - `hooks:data:parsers` parameters passed to the `data:parsers` hook
 * - `hooks:data:fetch` parameters passed to the `data:fetch` hook
 * - `hooks:data:reducers` parameters passed to the `data:reducers` hook
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
  const { json, filesToObject } = require('./lib/plugins');
  const { matchEngine } = require('./lib/utils');
  const srcFolder = api.pattern(src);
  const destFolder = api.resolve(dest);
  const { production } = env;
  const $hooks = this.getHooks();

  $hooks.tap('data:parsers', 'json', json);
  $hooks.tap('data:reducers', 'filesToObject', filesToObject);

  async function createDataFetcher(file, parsers) {
    const fetchers = $hooks.callWith(
      'data:fetch',
      [],
      params['hooks:data:fetch'],
      {
        file,
        pattern: data && api.pattern(data),
      },
    );
    const fetchResults = await Promise.all(fetchers);
    const files = [].concat(...fetchResults);

    return $hooks.callWith(
      'data:reducers',
      Promise.resolve({}),
      params['hooks:data:reducers'],
      files,
      parsers,
    );
  }

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

    let data;

    return gulp
      .src(srcFolder)
      .pipe(
        gulpData((file) => {
          if (!data) {
            data = createDataFetcher(file, parsers);
          }
          return data;
        }),
      )
      .pipe(
        map((code, filepath, { data = {} }) => {
          const engine = engineMatcher(extname(filepath));
          if (engine) {
            return engine.render(
              code,
              {
                page: {},
                ...data,
                PRODUCTION: production,
              },
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
