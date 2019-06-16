const { join } = require('path');
const fs = require('fs');
const { merge } = require('lodash');
const Hooks = require('./hooks');
const { resolvePath, resolvePatterns, logger } = require('./utils');

function loadProjectConfig(pattern, cwd) {
  const basePath = join(cwd, pattern);
  const localPath = basePath.replace(/\.js/, '.local.js');

  if (!fs.existsSync(basePath)) {
    logger.warn(`Configuration file not found: ${basePath}`);
  }
  try {
    const base = require(basePath);
    if (fs.existsSync(localPath)) {
      const local = require(localPath);
      if (typeof local === 'function') {
        return local(base);
      }
      return merge({}, base, local);
    }
    return base;
  } catch (e) {
    logger.error(e);
  }

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
  const { production = false, command = null, target = null } = argv;

  const env = {
    //unique build identifier
    buildHash: `buildhash${Date.now()}`,
    production,
    command,
    target: target || (production ? 'production' : 'development'),
    ...params,
    ...loadProjectConfig(configFile, cwd),
    pkg,
    argv,
    hooks: new Hooks(),
  };

  // utility methods
  env.resolve = (src) => resolvePath(src, env);
  env.pattern = (patterns) => resolvePatterns(patterns, env);

  //force production env
  if (env.production) {
    process.env.NODE_ENV = 'production';
  }

  return {
    env,
    task(fn, options = {}) {
      return fn(gulp, options, env);
    },
    series: gulp.series,
    parallel: gulp.parallel,
  };
}

module.exports = config;
