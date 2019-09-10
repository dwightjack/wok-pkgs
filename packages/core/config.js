const { join } = require('path');

const Hooks = require('./lib/hooks');
const { resolvePath, resolvePatterns, loadProjectConfig } = require('./utils');

/**
 * Creates a Wok configuration object reading the project config and environment.
 *
 * @param {Gulp} gulp a Gulp instance
 * @param {object} [params] Optional configuration parameters
 * @param {string} [params.cwd=process.cwd()] Working directory
 * @param {string} [params.configFile='Worker.config.js'] Path to a Wok config file, relative to `cwd`.
 * @returns {WokConfig}
 */
function config(gulp, params = {}) {
  const readPkgUp = require('read-pkg-up');
  const { cwd = process.cwd(), configFile = 'wok.config.js' } = params;
  const { pkg } = readPkgUp.sync({ cwd });

  const { argv } = require('yargs');
  const { production = false, command = null } = argv;
  const { target = production ? 'production' : null } = argv;
  const { src, dest, parallel, series, watch } = gulp;

  /**
   * Environment object.
   *
   * @memberof WokConfig
   * @property {boolean} production `--production` CLI flag.
   * @property {string} command `--command` CLI option.
   * @property {string} target `--target` CLI option. Defaults to `development` or to `production` if `--production` is set.
   * @property {object<string,*>} pkg `package.json` as an object.
   * @property {object} argv Parsed CLI arguments {@link https://github.com/yargs/yargs/blob/master/docs/api.md#argv}.
   * @property {*} Other properties defined into the `wok.config.js` object.
   */
  const env = {
    production,
    command,
    target,
    buildHash: `buildhash${Date.now()}`,
    publicPath: '/',
    ...loadProjectConfig(join(cwd, configFile), target),
    ...params,
    pkg,
    argv,
  };

  const globalHooks = new Hooks();

  /**
   * Public API.
   *
   * @memberof WokConfig
   * @property {function} src See {@link https://gulpjs.com/docs/en/api/src}.
   * @property {function} dest See {@link https://gulpjs.com/docs/en/api/dest}.
   * @property {Hooks} globalHooks A global instance of Hooks bound to the current configuration environment.
   * @property {function} resolve `resolvePath` bound to the current configuration environment.
   * @property {function} pattern `resolvePatterns` bound to the current configuration environment.
   */
  const api = {
    src,
    dest,
    globalHooks,
    resolve: (src) => resolvePath(src, env),
    pattern: (patterns) => resolvePatterns(patterns, env),
  };

  globalHooks.bind(env, api);

  //force production env
  if (env.production) {
    process.env.NODE_ENV = 'production';
  }

  /**
   * Returns a gulp watcher. Will execute the `watcher` hook on the `api.globalHooks` object.
   *
   * @memberof WokConfig
   * @param {object} params
   * @param {function} params.task Task function
   * @param {string} [params.id=task.name] Watcher id
   * @param {string[]} [params.patterns] Glob patterns to watch
   * @param {object} [options={ delay: 50 }] watch [options](https://gulpjs.com/docs/en/api/watch#options)
   */
  function watcher({ id, patterns, task }, options) {
    const taskList = [task];

    if (globalHooks.count('watcher') > 0) {
      taskList.push(function watchComplete() {
        return globalHooks.callWith(
          'watcher',
          Promise.resolve(),
          options,
          id || task.name,
        );
      });
    }

    return gulp.watch(
      api.pattern(patterns),
      Object.assign({ delay: 50 }, options),
      gulp.series(...taskList),
    );
  }

  /**
   * Higher order function to setup a task with parameters and hooks.
   *
   * @memberof WokConfig
   * @param {function} fn Task function
   * @param {object<string,*>} [params] task parameters
   * @param {Hook} [hooks] Hooks instance
   */
  function task(fn, params = {}, hooks) {
    const $hooks = hooks instanceof Hooks ? hooks : new Hooks();
    $hooks.bind(env, api);
    const ctx = {
      getHooks: () => $hooks,
    };
    return Object.defineProperties(fn.call(ctx, gulp, params, env, api), {
      $hooks: { value: $hooks },
      tap: {
        value(...args) {
          $hooks.tap(...args);
          return this;
        },
      },
    });
  }

  return {
    env,
    api,
    watcher,
    task,
    /**
     * Exposes the `series` method from the passed-in gulp instance.
     *
     * @function
     * @memberof WokConfig
     * @see https://gulpjs.com/docs/en/api/parallel
     */
    series,
    /**
     * Exposes the `parallel` method from the passed-in gulp instance.
     *
     * @function
     * @memberof WokConfig
     * @see https://gulpjs.com/docs/en/api/parallel
     */
    parallel,
    /**
     * Exposes the `watch` method from the passed-in gulp instance.
     *
     * @function
     * @memberof WokConfig
     * @see https://gulpjs.com/docs/en/api/watch
     */
    watch,
  };
}

/**
 * @namespace WokConfig
 */

module.exports = config;
