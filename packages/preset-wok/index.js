const { copy, clean } = require('@wok-cli/tasks');
const bump = require('@wok-cli/task-bump');
const styles = require('@wok-cli/task-styles');
const scripts = require('@wok-cli/task-scripts');
const modernizr = require('@wok-cli/task-modernizr');
const views = require('@wok-cli/task-views');
const { createPreset } = require('@wok-cli/core/preset');
const { runif } = require('@wok-cli/core/utils');
const imagemin = require('@wok-cli/plugin-imagemin');
const sass = require('@wok-cli/plugin-sass');
const rev = require('@wok-cli/task-rev');
const serve = require('@wok-cli/task-serve');
const { babel, eslint, stylelint, minifyJS } = require('./lib/hooks');

// passed-in config object
module.exports = (config) => {
  const preset = createPreset(config);

  const { env } = config;

  preset
    .set('bump', bump)
    .set('clean', clean, {
      pattern: ['<%= paths.dist.root %>/**/*', '<%= paths.tmp %>'],
    })
    .set('copy')
    .task(copy)
    .params({
      src: ['<%= paths.static %>/**/*'],
      dest: '<%= paths.dist.root %>',
    })
    .hook('process', 'imagemin', imagemin)
    .end()

    .set('styles')
    .task(styles)
    .hook('pre', 'stylelint', stylelint)
    .hook('pre', 'sass', sass)
    .params({
      src: ['<%= paths.src.root %>/<%= paths.styles %>/**/*.{sass,scss}'],
      dest: '<%= paths.dist.root %>/<%= paths.styles %>',
      'hooks:pre': {
        sass: {
          includePaths: ['<%= paths.src.vendors %>', 'node_modules'],
          publicPath: '/assets',
          basePath: '<%= paths.src.root %>/assets',
        },
      },
    })
    .end()

    .set('scripts')
    .task(scripts)
    .params({
      src: ['<%= paths.src.root %>/<%= paths.scripts %>/**/*.js'],
      dest: '<%= paths.dist.root %>/<%= paths.scripts %>',
    })
    .hook('pre', 'eslint', eslint)
    .hook('transform', 'babel', babel)
    .end()

    .set('modernizr', modernizr, {
      src: [
        '<%= paths.src.root %>/<%= paths.scripts %>/**/*.js',
        '<%= paths.src.root %>/<%= paths.styles %>/**/*.{sass,scss}',
      ],
      dest: '<%= paths.dist.root %>/<%= paths.dist.vendors %>/modernizr/',
      options: ['setClasses', 'addTest', 'testProp'],
    })
    .set('views')
    .task(views)
    .hook('engines', 'nunjucks', require('@wok-cli/plugin-render-nunjucks'))
    .hook('post', 'useref', require('@wok-cli/plugin-useref'))
    .params({
      src: ['<%= paths.src.views %>/**/*.*', '!<%= paths.src.views %>/**/_*.*'],
      dest: '<%= paths.dist.root %>',
      data: '<%= paths.src.fixtures %>/**/*.*',
      'hooks:engines': {
        nunjucks: {
          root: ['<%= paths.src.views %>', '<%= paths.src.fixtures %>'],
        },
      },
      'hooks:post': {
        useref: {
          searchPath: ['<%= paths.dist.root %>', '<%= paths.tmp %>'],
          // we need this to be inline to prevent the generation of multiple map files
          sourcemaps: true,
        },
      },
    })
    .end()
    .set('rev')
    .task(rev)
    .params({
      pattern: [
        '<%= paths.dist.root %>/assets/**/*',
        '<%= paths.dist.root %>/<%= paths.dist.vendors %>/modernizr/*.*',
      ],
      dest: '<%= paths.dist.root %>',
      manifest: '<%= paths.dist.root %>/<%= paths.dist.revmap %>',
    })
    .hook('before', 'minify', minifyJS)
    .end()

    .set('cleanup', clean, {
      pattern: ['<%= paths.tmp %>'],
    })
    .set('server', serve, {
      baseDir: ['<%= paths.dist.root %>', '<%= paths.static %>'],
    })
    .default(
      ({ clean, copy, styles, scripts, modernizr, views, cleanup, rev }) => {
        return config.series(
          clean,
          config.parallel(
            runif(() => env.$$isServe !== true, copy),
            styles,
            scripts,
            modernizr,
          ),
          views,
          runif(() => env.production, rev),
          cleanup,
        );
      },
    )
    .get('styles')
    .hook('complete', 'reload', (stream, env) => {
      if (env.$$isServe && env.livereload !== false) {
        const bs = serve.getServer(env);
        return stream.pipe(
          bs.stream,
          { match: '**/*.css' },
        );
      }
      return stream;
    })
    .end()
    .compose(
      'watch',
      ({ styles, scripts, server, views }, _, params) => {
        return function watch(done) {
          const reload = server.reload();

          [
            {
              patterns: preset.params('styles').get('src'),
              task: styles,
            },
            {
              patterns: preset.params('scripts').get('src'),
              task: config.series(scripts, reload),
            },
            {
              patterns: [
                '<%= paths.src.views %>/**/*.*',
                '<%= paths.src.fixtures %>/**/*.*',
              ],
              task: config.series(views, reload),
            },
            {
              id: 'static',
              patterns: ['<%= paths.static %>/**/*'],
              task: reload,
            },
          ].map((cfg) => config.watcher(cfg, params));
          done();
        };
      },
    )
    .compose(
      'serve',
      ({ default: def, server, watch }) => {
        function setup() {
          env.$$isServe = true;
          return Promise.resolve();
        }
        return config.series(setup, def, config.parallel(server, watch));
      },
    );

  if (env.production) {
    preset
      .params('scripts')
      .set('dest', '<%= paths.tmp %>/<%= paths.scripts %>');
    preset
      .params('modernizr')
      .set('dest', '<%= paths.tmp %>/<%= paths.dist.vendors %>/modernizr');
    preset.params('styles').set('dest', '<%= paths.tmp %>/<%= paths.styles %>');

    preset.params('server').set('baseDir', ['<%= paths.dist.root %>']);
  }

  return preset;
};
