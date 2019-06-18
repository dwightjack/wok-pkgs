const log = require('fancy-log');
const { red, yellow, blue } = require('ansi-colors');
const template = require('lodash/template');
const through2 = require('through2');
const lazypipe = require('lazypipe');
const PluginError = require('plugin-error');
const gulp = require('gulp');

const logger = {
  msg: (str) => log(blue(str)),
  error: (str) => log(red(str)),
  warn: (str) => log(yellow(str)),
};

const resolveTemplate = (v, data) => {
  if (typeof v !== 'string') {
    return v;
  }
  return template(v)(data);
};

const resolvePatterns = (patterns, data) => {
  const tmpl = (p) => resolveTemplate(p, data);
  return [].concat(patterns).map(tmpl);
};

const noopStream = () => through2.obj();

const pipeChain = () => lazypipe().pipe(noopStream);

const tap = (fn) =>
  through2.obj((file, enc, cb) => {
    fn(file);
    cb(null, file);
  });

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

const createPlugin = ({ name, plugin, productionOnly = false, test }) => {
  return (stream, env, api, opts, ...rest) => {
    if (productionOnly && !env.production) {
      return stream;
    }

    const pluginOpts = opts && opts[name] !== undefined ? opts[name] : {};

    if (typeof test === 'function' && test(env, pluginOpts) === false) {
      return stream;
    }

    return plugin(stream, env, api, pluginOpts, ...rest);
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
  tap,
  dest: gulp.dest,
  src: gulp.src,
  createPlugin,
  camelCase: require('lodash/camelCase'),
};
