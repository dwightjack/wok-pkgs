const log = require('fancy-log');
const { red, yellow } = require('ansi-colors');
const template = require('lodash/template');
const through2 = require('through2');
const lazypipe = require('lazypipe');
const PluginError = require('plugin-error');
const gulp = require('gulp');

const logger = {
  msg: (str) => log(red(str)),
  error: (str) => log(red(str)),
  warn: (str) => log(yellow(str)),
};

const resolveTemplate = (str, data) => template(str)(data);

const resolvePatterns = (patterns, data) => {
  const tmpl = (p) => resolveTemplate(p, data);
  return [].concat(patterns).map(tmpl);
};

const noopStream = () => through2.obj();

const pipeChain = () => lazypipe().pipe(noopStream);

const map = (fn) => {
  const mapFn = typeof fn === 'function' ? fn : (val) => val;

  return through2.obj(function mapIterator(file, enc, cb) {
    if (file.isNull()) {
      this.push(file);
      cb();
      return;
    }
    if (file.isStream()) {
      this.emit(
        'error',
        new PluginError('wok-core/map', 'Streaming not supported'),
      );
    }

    try {
      file.contents = Buffer.from(
        mapFn(file.contents.toString(), file.path, file),
      ); //eslint-disable-line no-param-reassign
    } catch (err) {
      this.emit('error', new PluginError('wok-core/map', err.toString()));
    }

    this.push(file);

    cb();
  });
};

const createPlugin = ({ name, plugin, productionOnly = false }) => {
  return (stream, env, api, opts = {}) => {
    if (productionOnly && !env.production) {
      return stream;
    }

    return plugin(stream, env, api, opts[name] !== undefined ? opts[name] : {});
  };
};

module.exports = {
  logger,
  resolvePatterns,
  resolveTemplate,
  resolvePath: resolveTemplate,
  noopStream,
  pipeChain,
  map,
  dest: gulp.dest,
  src: gulp.src,
  createPlugin,
  camelCase: require('lodash/camelCase'),
};
