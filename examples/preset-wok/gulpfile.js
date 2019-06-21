const gulp = require('gulp');
const config = require('wok-core');
const preset = require('preset-wok');

const $ = config(gulp);

const wok = preset($);

wok.hook('watcher', 'notifier', require('plugin-notifier')).params('watch', {
  notifier: {
    message: 'Updated!',
  },
});

module.exports = wok.resolve();
