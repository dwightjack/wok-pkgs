module.exports = (gulp, { src = '', dest = '', data = '' }, env) => {
  const { extname } = require('path');
  const rename = require('gulp-rename');
  const { map } = require('wok-core/utils');

  const dataReader = require('./lib/data-reader');
  const { matchParser, matchEngine } = require('./lib/utils');
  const srcFolder = env.pattern(src);
  const destFolder = env.resolve(dest);
  const { production, hooks } = env;

  hooks.tap('views:data:parsers', 'json', (parsers) => {
    return parsers.set('json', {
      test: /\.json$/,
      parse: (raw) => JSON.parse(raw),
    });
  });

  hooks.tap(
    'views:data',
    'global',
    (stream, dataPatter, parsersMatcher, env) => {
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
      parsers = hooks.callWith('views:data:parsers', new Map(), env);
      dataPattern = env.pattern(data);
    }

    const engineMatcher = matchEngine(
      hooks.callWith('views:engines', new Map(), env),
    );

    return gulp
      .src(srcFolder)
      .pipe(hooks.call('views:data', dataPattern, matchParser(parsers), env))
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
          extname: env.views.outputExt || '.html',
        }),
      )
      .pipe(hooks.call('views:post', env))
      .pipe(gulp.dest(destFolder));
  };
};
