const { join } = require('path');

const Hooks = require('./lib/hooks');
const { resolvePath, resolvePatterns, loadProjectConfig } = require('./utils');

/**
 * Creates a configuration object reading the project config and environment.
 *
 * @param {Gulp} gulp a Gulp instance
 * @param {object} [params] Optional configuration parameters
 */
function config(gulp, params = {}) {
  const readPkgUp = require('read-pkg-up');
  const { cwd = process.cwd(), configFile = 'wok.config.js' } = params;
  const { pkg } = readPkgUp.sync({ cwd });

  const { argv } = require('yargs');
  const { production = false, command = null } = argv;
  const { target = production ? 'production' : null } = argv;

  const env = {
    /** `--production` CLI flag  */
    production,
    /** `--command`  */
    command,
    /**
     * `--target` CLI option. Defaults to `development` or to `production` if `--production` is set
     */
    target,
    /** unique build identifier */
    buildHash: `buildhash${Date.now()}`,
    ...loadProjectConfig(join(cwd, configFile), target),
    ...params,
    /** package.json object */
    pkg,
    /** @see https://github.com/yargs/yargs/blob/master/docs/api.md#argv */
    argv,
  };

  const globalHooks = new Hooks();

  /**
   * Internal api
   * @type {object}
   */
  const api = {
    /**
     * @deprecated
     */
    hooks: globalHooks,
    /**
     * configuration-wide hooks instance.
     * @type {Hook}
     */
    globalHooks,
    /**
     * Resolves a lodash template using the environment as data.
     *
     * @see resolvePath
     */
    resolve: (src) => resolvePath(src, env),
    /**
     * Resolves an array of lodash template using the environment as data.
     *
     * @see resolvePatterns
     */
    pattern: (patterns) => resolvePatterns(patterns, env),
  };

  globalHooks.bind(env, api);

  //force production env
  if (env.production) {
    process.env.NODE_ENV = 'production';
  }

  /**
   * Returns a gulp watcher. Will execute the `watcher` hook on the `globalHooks` object.
   *
   * @param {object} params
   * @param {function} params.task Task function
   * @param {string} [params.id=task.name] Watcher id
   * @param {string[]} [params.patterns] Glob patterns to watch
   * @param {*} options
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
   * @param {function} fn Task function
   * @param {object} [params] task parameters
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
     * @see https://gulpjs.com/docs/en/api/series
     */
    series: gulp.series,
    /**
     * @see https://gulpjs.com/docs/en/api/parallel
     */
    parallel: gulp.parallel,
    /**
     * @see https://gulpjs.com/docs/en/api/watch
     */
    watch: gulp.watch,
  };
}

module.exports = config;
