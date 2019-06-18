module.exports = (
  gulp,
  { src = '', dest = '', data = '', ...params },
  env,
  api,
) => {
  const { extname } = require('path');
  const rename = require('gulp-rename');
  const { map, noopStream } = require('wok-core/utils');

  const { json, dataExtract } = require('./lib/plugins');
  const { matchParser, matchEngine } = require('./lib/utils');
  const srcFolder = api.pattern(src);
  const destFolder = api.resolve(dest);
  const { production } = env;
  const { hooks } = api;

  hooks.tap('views:data:parsers', 'json', json);
  hooks.tap('views:data', 'global', dataExtract);

  return function views() {
    let parsers;
    let dataPattern;

    if (data) {
      parsers = hooks.callWith(
        'views:data:parsers',
        new Map(),
        params['hooks:data:parsers'],
      );
      dataPattern = api.pattern(data);
    }

    const engineMatcher = matchEngine(
      hooks.callWith('views:engines', new Map(), params['hooks:engines']),
    );

    return gulp
      .src(srcFolder)
      .pipe(
        dataPattern
          ? hooks.call(
              'views:data',
              params['hooks:data'],
              dataPattern,
              matchParser(parsers),
            )
          : noopStream,
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
      .pipe(hooks.call('views:post', params['hooks:post']))
      .pipe(gulp.dest(destFolder))
      .pipe(api.hooks.call('views:complete', params['hooks:complete']))
      .pipe(noopStream()); // adds a noop stream to fix this error: https://stackoverflow.com/questions/40098156/what-about-this-combination-of-gulp-concat-and-lazypipe-is-causing-an-error-usin/40101404#40101404
  };
};
