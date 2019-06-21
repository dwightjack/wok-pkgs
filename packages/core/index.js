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
    task(fn, options = {}) {
      return fn(gulp, options, env, api);
    },
    api,
    series: gulp.series,
    parallel: gulp.parallel,
    watch: gulp.watch,
    watcher({ patterns, task, options = { delay: 50 } }) {
      return gulp.watch(api.pattern(patterns), options, task);
    },
  };
}

module.exports = config;
