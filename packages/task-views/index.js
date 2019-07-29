module.exports = function(
  gulp,
  { src = '', dest = '', data = '', ...params },
  env,
  api,
) {
  const { extname } = require('path');
  const { map, noopStream } = require('@wok-cli/core/utils');
  const { json, dataExtract } = require('./lib/plugins');
  const { matchEngine } = require('./lib/utils');
  const srcFolder = api.pattern(src);
  const destFolder = api.resolve(dest);
  const { production } = env;
  const $hooks = this.getHooks();

  $hooks.tap('data:parsers', 'json', json);
  $hooks.tap('data', 'global', dataExtract);

  return function views() {
    const rename = require('gulp-rename');
    let parsers;
    let dataPattern;

    if (data) {
      parsers = $hooks.callWith(
        'data:parsers',
        new Map(),
        params['hooks:data:parsers'],
      );
      dataPattern = api.pattern(data);
    }

    const engineMatcher = matchEngine(
      $hooks.callWith('engines', new Map(), params['hooks:engines']),
    );

    return gulp
      .src(srcFolder)
      .pipe(
        dataPattern
          ? $hooks.call('data', params['hooks:data'], dataPattern, [
              ...parsers.values(),
            ])
          : noopStream(),
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
