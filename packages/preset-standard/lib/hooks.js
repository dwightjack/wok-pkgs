const { noopStream, createPlugin } = require('@wok-cli/core/utils');

const babel = createPlugin({
  name: 'babel',
  plugin: (stream, env) =>
    stream.pipe(
      require('gulp-babel'),
      env.babel,
    ),
});

const eslint = createPlugin({
  name: 'eslint',
  test: (env) => env.lint !== false,
  plugin(stream, env) {
    const glint = require('gulp-eslint');
    return stream
      .pipe(
        glint,
        env.eslint,
      )
      .pipe(glint.format)
      .pipe(env.production ? glint.failAfterError : noopStream);
  },
});

const stylelint = createPlugin({
  name: 'stylelint',
  test: (env) => env.lint !== false,
  plugin(stream, env) {
    return stream.pipe(
      require('gulp-stylelint'),
      env.stylelint || {
        reporters: [{ formatter: 'string', console: true }],
      },
    );
  },
});

const minifyJS = createPlugin({
  name: 'minifyJS',
  productionOnly: true,
  plugin(stream, env, api, opts) {
    const minify = require('gulp-minify');
    const gulpif = require('gulp-if');
    const options = Object.assign(
      { preserveComments: 'some', ext: '.js', noSource: true },
      opts,
    );

    return stream.pipe(() => gulpif('*.js', minify(options)));
  },
});

module.exports = { babel, eslint, stylelint, minifyJS };
