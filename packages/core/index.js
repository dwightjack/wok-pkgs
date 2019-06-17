const { join } = require('path');
const fs = require('fs');
const { merge } = require('lodash');
const Hooks = require('./hooks');
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

  // const { locals, globals } = files.reduce(
  //   (acc, file) => {
  //     const mod = require(join(cwd, file));
  //     const key = basename(file, '.js');
  //     if (key.endsWith('.local')) {
  //       acc.locals[camelCase(key.replace('.local', ''))] = mod;
  //     } else {
  //       acc.globals[camelCase(key)] = mod;
  //     }
  //     return acc;
  //   },
  //   {
  //     locals: {},
  //     globals: {},
  //   },
  // );

  // return Object.entries(globals).reduce((acc, [key, globalConf]) => {
  //   const localConf = locals[key] || {};
  //   const conf =
  //     typeof localConf === 'function'
  //       ? localConf(globalConf)
  //       : merge({}, globalConf, localConf);
  //   acc[key] = conf;

  //   return acc;
  // }, {});
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

  const api = {
    hooks: new Hooks(),
    resolve: (src) => resolvePath(src, env),
    pattern: (patterns) => resolvePatterns(patterns, env),
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
  };
}

module.exports = config;
