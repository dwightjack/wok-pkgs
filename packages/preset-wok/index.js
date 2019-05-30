const bump = require('task-bump');
const styles = require('task-styles');
const { copy, clean } = require('wok-core/tasks');
const { createPreset } = require('wok-core/preset');
const imagemin = require('plugin-imagemin');
const rev = require('plugin-rev');
const { sass, stylesRename } = require('./lib/hooks');

// passed-in config object
module.exports = (config) => {
  const revImgs = rev({
    manifest: '<%= paths.dist.root %>/<%= paths.dist.revmap %>',
  });
  const preset = createPreset(config);

  preset
    .set('bump', bump)
    .set('clean', clean)
    .params('clean', {
      pattern: '<%= paths.dist.root %>/**/*',
    })
    .set('copy', copy)
    .params('copy', {
      pattern: ['<%= paths.static %>/**/*'],
      dest: '<%= paths.dist.root %>',
    })
    .hook('copy:beforeWrite', 'imagemin', imagemin())
    .hook('copy:beforeWrite', 'revImgs', revImgs.apply)
    .hook('copy:complete', 'revManifest', revImgs.write)
    .set('styles', styles)
    .params('styles', {
      src: ['<%= paths.src.root %>/<%= paths.styles %>/**/*.{sass,scss}'],
      dest: '<%= paths.dist.root %>/<%= paths.styles %>',
    })
    .hook('styles:pre', 'sass', sass)
    .hook('styles:post', 'rename', stylesRename)
    .default(({ clean, copy, styles }) =>
      config.series(clean, config.parallel(copy, styles)),
    );

  return preset;
};
