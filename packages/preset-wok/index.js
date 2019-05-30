const bump = require('task-bump');
const { copy, clean } = require('wok-core/tasks');
const { createPreset } = require('wok-core/preset');
const imagemin = require('plugin-imagemin');
const rev = require('plugin-rev');

// passed-in config object
module.exports = (config) => {
  const revImgs = rev({
    manifest: '<%= paths.dist.root %>/<%= paths.dist.revmap %>',
  });

  const preset = createPreset(config);

  preset
    .set('bump', bump)
    .set('clean', clean)
    .params('clean')
    .set('pattern', '<%= paths.dist.root %>/**/*')
    .end()
    .set('copy', copy)
    .params('copy')
    .set('pattern', ['<%= paths.static %>/**/*'])
    .set('dest', '<%= paths.dist.root %>')
    .end()
    .hook('copy:beforeWrite', 'imagemin', imagemin())
    .hook('copy:beforeWrite', 'revImgs', revImgs.apply)
    .hook('copy:complete', 'revManifest', revImgs.write)
    .default(({ clean, copy }) => config.series(clean, copy));

  return preset;
};
