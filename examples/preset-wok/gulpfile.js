const gulp = require('gulp');
const config = require('wok-core');
const { deploy, copy } = require('wok-core/tasks');

const preset = require('preset-wok');
const ssh = require('task-ssh');
const rsync = require('plugin-deploy-rsync');

const $ = config(gulp);

const wok = preset($);

wok.hook('watcher', 'notifier', require('plugin-notifier')).params('watch', {
  notifier: {
    message: 'Updated!',
  },
});

wok.set('remote', ssh);

const backup = $.task(ssh, { command: 'backup' });
const sync = $.task(
  deploy,
  {
    src: '<%= paths.dist.root %>',
    exclude: ['.svn*', '.tmp*', '.idea*', '.sass-cache*', '*.sublime-*'],
  },
  { $hooks: 'sync' },
);

wok.set('deploy').compose(() => $.series(backup, sync));
wok.hook('sync:strategy', 'rsync', rsync);

wok.delete('copy');

const copyTask = $.task(copy, {
  pattern: ['<%= paths.static %>/**/*'],
  dest: '<%= paths.dist.root %>',
});

copyTask.$hooks.tap('complete', 'log', (stream, ...args) => {
  console.log(args);
  return stream;
});

wok.compose(
  'copy',
  () => copyTask,
);

module.exports = wok.resolve();
