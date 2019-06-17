const { copy, clean } = require('wok-core/tasks');
const bump = require('task-bump');
const styles = require('task-styles');
const scripts = require('task-scripts');
const modernizr = require('task-modernizr');
const views = require('task-views');
const { createPreset } = require('wok-core/preset');
const imagemin = require('plugin-imagemin');
const sass = require('plugin-sass');
const rev = require('plugin-rev');
const { stylesRename, babel, eslint, stylelint } = require('./lib/hooks');

// passed-in config object
module.exports = (config) => {
  const preset = createPreset(config);

  preset
    .set('bump', bump)
    .set('clean', clean)
    .params('clean', {
      pattern: '<%= paths.dist.root %>/**/*',
    })
    .set('copy', copy)
    .hook('copy:beforeWrite', 'imagemin', imagemin)
    .hook('copy:beforeWrite', 'revImgs', rev.apply)
    .hook('copy:complete', 'revManifest', rev.write)
    .params('copy', {
      pattern: ['<%= paths.static %>/**/*'],
      dest: '<%= paths.dist.root %>',
      'hooks:complete': {
        'rev:write': {
          manifest: '<%= paths.dist.root %>/<%= paths.dist.revmap %>',
        },
      },
    })

    .set('styles', styles)
    .params('styles', {
      src: ['<%= paths.src.root %>/<%= paths.styles %>/**/*.{sass,scss}'],
      dest: '<%= paths.dist.root %>/<%= paths.styles %>',
    })
    .hook('styles:pre', 'stylelint', stylelint)
    .hook('styles:pre', 'sass', sass)
    .params('styles', {
      'hooks:pre': {
        sass: {
          includePaths: ['<%= paths.src.vendors %>', 'node_modules'],
          publicPath: '/assets',
          basePath: '<%= paths.src.root %>/assets',
        },
      },
    })
    .hook('styles:post', 'rename', stylesRename)
    .set('scripts', scripts)
    .params('scripts', {
      src: ['<%= paths.src.root %>/<%= paths.scripts %>/**/*.js'],
      dest: '<%= paths.dist.root %>/<%= paths.scripts %>',
    })
    .hook('scripts:pre', 'eslint', eslint)
    .hook('scripts:transform', 'babel', babel)
    .set('modernizr', modernizr)
    .params('modernizr', {
      src: [
        '<%= paths.src.root %>/<%= paths.scripts %>/**/*.js',
        '<%= paths.src.root %>/<%= paths.styles %>/**/*.{sass,scss}',
      ],
      dest: '<%= paths.dist.root %>/<%= paths.scripts %>',
      options: ['setClasses', 'addTest', 'testProp'],
    })
    .set('views', views)
    .hook('views:engines', 'nunjucks', require('plugin-render-nunjucks'))
    .hook('views:post', 'useref', require('plugin-useref'))
    .params('views', {
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
        },
      },
    })
    .default(({ clean, copy, styles, scripts, modernizr, views }) =>
      config.series(
        clean,
        config.parallel(copy, styles, scripts, modernizr, views),
      ),
    );

  return preset;
};
