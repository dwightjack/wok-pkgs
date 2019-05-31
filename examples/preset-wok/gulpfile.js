const gulp = require('gulp');
const config = require('wok-core');
const preset = require('preset-wok');

const $ = config(gulp);

module.exports = preset($).resolve();
