module.exports = (
  gulp,
  { src = '', dest = '', data = '', ...params },
  env,
  api,
) => {
  const { extname } = require('path');
  const rename = require('gulp-rename');
  const { map } = require('wok-core/utils');

  const dataReader = require('./lib/data-reader');
  const { matchParser, matchEngine } = require('./lib/utils');
  const srcFolder = api.pattern(src);
  const destFolder = api.resolve(dest);
  const { production } = env;
  const { hooks } = api;

  hooks.tap('views:data:parsers', 'json', (parsers) => {
    return parsers.set('json', {
      test: /\.json$/,
      parse: (raw) => JSON.parse(raw),
    });
  });

  hooks.tap(
    'views:data',
    'global',
    (stream, env, api, dataPatter, parsersMatcher) => {
      const readerPromise = dataReader(dataPatter, parsersMatcher, env);
      return stream.pipe(
        require('gulp-data'),
        () => readerPromise,
      );
    },
  );

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
        hooks.call(
          'views:data',
          dataPattern,
          matchParser(parsers),
          params['hooks:data'],
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
      .pipe(gulp.dest(destFolder));
  };
};
