const { join } = require('path');
const fs = require('fs');
const { merge } = require('lodash');
const Hooks = require('./lib/hooks');
const { resolvePath, resolvePatterns, logger } = require('./utils');

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

function config(gulp, params = {}) {
  const readPkgUp = require('read-pkg-up');
  const { cwd = process.cwd(), configFile = 'wok.config.js' } = params;
  const { pkg } = readPkgUp.sync({ cwd });

  const { argv } = require('yargs');
  const { production = false, command = null } = argv;
  const { target = production ? 'production' : 'development' } = argv;

  const env = {
    //unique build identifier
    buildHash: `buildhash${Date.now()}`,
    production,
    command,
    target,
    ...loadProjectConfig(join(cwd, configFile), target),
    ...params,
    pkg,
    argv,
  };

  // const $callCache = new Map();

  const api = {
    hooks: new Hooks(),
    resolve: (src) => resolvePath(src, env),
    pattern: (patterns) => resolvePatterns(patterns, env),
    // cachable(fn) {
    //   const cached = (...args) => {
    //     const ret = fn(...args);
    //     $callCache.set(fn.name, ret);
    //     return ret;
    //   };

    //   Object.defineProperty(cached, 'name', { value: fn.name });
    //   return cached;
    // },
    // cache(id) {
    //   return $callCache.get(id);
    // },
  };

  api.hooks.bind(env, api);

  // utility methods

  //force production env
  if (env.production) {
    process.env.NODE_ENV = 'production';
  }

  return {
    env,
    task(fn, params = {}, hooks) {
      const $hooks = hooks instanceof Hooks ? hooks : new Hooks();
      $hooks.bind(env, api);
      const ctx = {
        getHooks: () => $hooks,
      };
      return Object.defineProperty(
        fn.call(ctx, gulp, params, env, api),
        '$hooks',
        {
          value: $hooks,
        },
      );
    },
    api,
    series: gulp.series,
    parallel: gulp.parallel,
    watch: gulp.watch,
    watcher({ id, patterns, task }, options) {
      const taskList = [task];

      if (api.hooks.count('watcher') > 0) {
        taskList.push(function watchComplete() {
          return api.hooks.callWith(
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
    },
  };
}

module.exports = config;
