const gulp = require('gulp');
const config = require('wok-core');
const { deploy } = require('wok-core/tasks');

const preset = require('preset-wok');
const ssh = require('task-ssh');
const rsync = require('plugin-deploy-rsync');

const $ = config(gulp);

const wok = preset($);

wok
  .globalHook('watcher', 'notifier', require('plugin-notifier'))
  .params('watch', {
    notifier: {
      message: 'Updated!',
    },
  });

wok.set('remote', ssh);

const backup = $.task(ssh, { command: 'backup' });
const sync = $.task(deploy, {
  src: '<%= paths.dist.root %>',
  exclude: ['.svn*', '.tmp*', '.idea*', '.sass-cache*', '*.sublime-*'],
});

sync.$hooks.tap('strategy', 'rsync', rsync);

wok.set('deploy').compose(() => $.series(backup, sync));

module.exports = wok.resolve();
