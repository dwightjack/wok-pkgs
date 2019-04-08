const bump = require('task-bump');
const { copy, clean } = require('wok-core/tasks');
const imagemin = require('plugin-imagemin');
const rev = require('plugin-rev');

// passed-in config object
module.exports = ({ tasks, series }) => {
  const revImgs = rev({
    manifest: '<%= paths.dist.root %>/<%= paths.dist.revmap %>',
  });

  const taskList = tasks({
    bump,
    clean: [clean, { pattern: '<%= paths.dist.root %>/**/*' }],
    copy: [
      copy,
      {
        pattern: ['<%= paths.static %>/**/*'],
        dest: '<%= paths.dist.root %>',
      },
    ],
  });

  taskList.copy.hooks.before.tap('imageMin', imagemin());
  taskList.copy.hooks.before.tap('revImages', revImgs.apply);
  taskList.copy.hooks.after.tap('revManifest', revImgs.write);

  return { ...taskList, default: series(taskList.clean, taskList.copy) };
};
