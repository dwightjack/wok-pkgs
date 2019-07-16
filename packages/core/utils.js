const fs = require('fs');
const log = require('fancy-log');
const { red, yellow, blue } = require('ansi-colors');
const template = require('lodash/template');
const merge = require('lodash/merge');
const through2 = require('through2');
const lazypipe = require('lazypipe');
const PluginError = require('plugin-error');

/**
 * @module Utils
 */

/**
 * Converts a string to camel case.
 *
 * @see https://lodash.com/docs/4.17.11#camelCase
 * @params {string} str
 * @function
 */
const camelCase = require('lodash/camelCase');

/**
 * Logger object.
 *
 * @namespace
 * @type {object}
 */
const logger = {
  /**
   * Shows a normal message.
   *
   * @param {string} str Message
   */
  msg(str) {
    log(blue(str));
  },
  /**
   * Shows an error message.
   *
   * @param {string} str Message
   */
  error(str) {
    log(red(str));
  },
  /**
   * Shows a warning message.
   *
   * @param {string} str Message
   */
  warn(str) {
    log(yellow(str));
  },
};

/**
 * Renders a lodash template with data.
 *
 * @see https://lodash.com/docs#template
 * @param {string} tmpl lodash template
 * @param {*} data template data
 * @returns {string}
 * @example
 * const tmpl = 'src/<%= js %>'
 * resolveTemplate(tmpl, { js: '*.js' }) === 'src/*.js'
 */
function resolveTemplate(tmpl, data) {
  if (typeof tmpl !== 'string') {
    return tmpl;
  }
  return template(tmpl)(data);
}

/**
 * Alias for {@link resolveTemplate}.
 *
 * @name resolvePath
 * @function
 */
const resolvePath = resolveTemplate;

/**
 * Resolves an array of lodash templates with data.
 *
 * @param {string[]|string} patterns Array of templates or a single template
 * @param {*} data template data
 * @returns {string[]}
 * @example
 * const patterns = ['src/<%= js %>', 'tmp/<%= js %>']
 * resolvePatterns(patterns, { js: '*.js' }) === ['src/*.js', 'tmp/*.js']
 */
function resolvePatterns(patterns, data) {
  const tmpl = (p) => resolveTemplate(p, data);
  return [].concat(patterns).map(tmpl);
}

/**
 * Returns an empty stream.
 *
 * @function
 * @returns {stream}
 */
const noopStream = () => through2.obj();

/**
 * Returns an empty lazypipe.
 *
 * @function
 * @see https://github.com/OverZealous/lazypipe
 */
const pipeChain = () => lazypipe().pipe(noopStream);

/**
 * Performs a side-effect onto a stream by executing `fn` with the current vinyl file instance.
 *
 * @param {function} fn
 * @example
 * const basename = (file) => console.log(file.basename)
 *
 * gulp
 *  .src('*.js')
 *  .pipe(tap(basename))
 *  .pipe(gulp.dest('dist'))
 *
 * // will log "application.js", "..."
 */
function tap(fn) {
  return through2.obj((file, enc, cb) => {
    fn(file);
    cb(null, file);
  });
}

/**
 * Executes a transformer function over the current vinyl file content
 * and sets the returned string as the new file contents.
 *
 * @param {function} fn transformer function
 * @returns {stream}
 * @example
 * const transform = (src) => src.toUpperCase()
 *
 * gulp
 *  .src('*.js')
 *  .pipe(map(transform))
 *  .pipe(gulp.dest('dist'))
 */
function map(fn) {
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
        new PluginError('@wok-cli/core/map', 'Streaming not supported'),
      );
    }

    try {
      file.contents = Buffer.from(
        mapFn(file.contents.toString(), file.path, file),
      ); //eslint-disable-line no-param-reassign
    } catch (err) {
      this.emit('error', new PluginError('@wok-cli/core/map', err.toString()));
    }

    this.push(file);

    cb();
  });
}

/**
 * Creates a task hook plugin with options.
 *
 * @param {object} options
 * @param {string} options.name Plugin internal name
 * @param {boolean} [options.productionOnly=false] If `true` the plugin will be executed just when env.production is `true`
 * @param {function} [options.test] A function receiving the task `env` object. If the function returns false the plugin will not be executed.
 * @param {function} [options.params] A function that returns the plugin params from the task params
 */
function createPlugin({ name, plugin, productionOnly = false, test, params }) {
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
}

/**
 * Runs a task only if `cond` return `true`
 * @param {function} cond Conditional function
 * @param {function} task Task to run
 * @returns {function}
 * @example
 *
 * const taskIf = runIf(() => process.env.NODE_ENV === 'production', minify)
 * exports.minify = taskIf
 *
 */
function runif(cond, task) {
  return Object.defineProperty(
    function(...args) {
      return cond() === true ? task(...args) : Promise.resolve();
    },
    'name',
    { value: task.name },
  );
}

/**
 * Returns a target host object based on the `--target` CLI flag and the `hosts` object set in the config.
 *
 * Returns `false` if a target is not found.
 *
 * @param {object} env Environment object
 * @param {string} env.target Current target
 * @param {object<string,object>} env.hosts Configured hosts
 * @returns {object|false}
 */
function getEnvTarget({ target, hosts }) {
  const targets = Object.keys(hosts).filter((host) => !!hosts[host].host);
  if (!target || targets.includes(target) === false) {
    logger.error(
      'ERROR: Remote target unavailable. Specify it via `--target` argument. Allowed targets are: ' +
        targets.join(', '),
    );
    return false;
  }
  return hosts[target];
}

/**
 * Loads a configuration file. Will also try to load any `.local.js` file
 * and merge it with the default configuration.
 *
 * If the configuration file exports a function it will be executed with the
 * previous configuration and the current target as arguments
 *
 * @param {string} basePath Base configuration file path
 * @param {string} target The current target
 * @returns {object}
 */
function loadProjectConfig(basePath, target) {
  const localPath = basePath.replace(/\.js/, '.local.js');

  if (!fs.existsSync(basePath)) {
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
  resolvePath,
  noopStream,
  pipeChain,
  loadProjectConfig,
  map,
  tap,
  createPlugin,
  runif,
  getEnvTarget,
  camelCase,
};
