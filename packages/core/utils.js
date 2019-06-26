const fs = require('fs');
const log = require('fancy-log');
const { red, yellow, blue } = require('ansi-colors');
const template = require('lodash/template');
const merge = require('lodash/merge');
const through2 = require('through2');
const lazypipe = require('lazypipe');
const PluginError = require('plugin-error');
const gulp = require('gulp');
const base = require('./tasks/base');

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

const createPlugin = ({
  name,
  plugin,
  productionOnly = false,
  test,
  params,
}) => {
  return (prev, env, api, opts, ...rest) => {
    if (productionOnly && !env.production) {
      return prev;
    }

    let pluginOpts;

    if (typeof params === 'function') {
      pluginOpts = params(opts);
    } else {
      pluginOpts = opts && opts[name] !== undefined ? opts[name] : {};
    }

    if (
      pluginOpts === false ||
      (typeof test === 'function' && test(env, pluginOpts) === false)
    ) {
      return prev;
    }

    return plugin(prev, env, api, pluginOpts, ...rest);
  };
};

const createTask = (name, defs) => {
  return function(gulp, params = {}, ...args) {
    return base.call(this, gulp, { ...params, ...defs, name }, ...args);
  };
};

const runif = (cond, task) => {
  const wrapFn = (...args) =>
    cond() === true ? task(...args) : Promise.resolve();

  Object.defineProperty(wrapFn, 'name', { value: task.name });
  return wrapFn;
};

const getEnvTarget = ({ target, hosts }) => {
  const targets = Object.keys(hosts).filter((host) => !!hosts[host].host);
  if (!target || targets.includes(target) === false) {
    logger.error(
      'ERROR: Remote target unavailable. Specify it via `--target` argument. Allowed targets are: ' +
        targets.join(', '),
    );
    return false;
  }
  return hosts[target];
};

function loadProjectConfig(basePath, target) {
  const localPath = basePath.replace(/\.js/, '.local.js');

  if (!fs.existsSync(basePath)) {
    logger.warn(`Configuration file not found: ${basePath}`);
    return {};
  }

  return [basePath, localPath].reduce((acc, filepath) => {
    try {
      if (!fs.existsSync(filepath)) {
        return acc;
      }
      const config = require(filepath);
      if (typeof config === 'function') {
        return config(acc, target);
      }
      return merge(acc, config);
    } catch (e) {
      logger.error(e);
      return acc;
    }
  }, {});
}

module.exports = {
  logger,
  resolvePatterns,
  resolveTemplate,
  resolvePath: resolveTemplate,
  noopStream,
  pipeChain,
  loadProjectConfig,
  map,
  tap,
  dest: gulp.dest,
  src: gulp.src,
  createPlugin,
  createTask,
  runif,
  getEnvTarget,
  camelCase: require('lodash/camelCase'),
};
