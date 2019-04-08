const { join, basename } = require('path');
const glob = require('globby');
const { camelCase, merge } = require('lodash');

function loadProjectConfigs(pattern, cwd) {
  const files = glob.sync(pattern, { cwd });

  const { locals, globals } = files.reduce(
    (acc, file) => {
      const mod = require(join(cwd, file));
      const key = basename(file, '.js');
      if (key.endsWith('.local')) {
        acc.locals[camelCase(key.replace('.local.', ''))] = mod;
      } else {
        acc.globals[camelCase(key)] = mod;
      }
      return acc;
    },
    {
      locals: {},
      globals: {},
    },
  );

  return Object.entries(globals).reduce((acc, [key, globalConf]) => {
    const localConf = locals[key] || {};
    const conf =
      typeof localConf === 'function'
        ? localConf(globalConf)
        : merge({}, globalConf, localConf);
    acc[key] = conf;

    return acc;
  }, {});
}

function config(g, params = {}) {
  const readPkgUp = require('read-pkg-up');
  const { cwd = process.cwd(), configFiles = ['build/config/*.js'] } = params;
  const { pkg } = readPkgUp.sync({ cwd });

  const { argv } = require('yargs');
  const { production = false, command = null, target = null } = argv;

  const env = {
    //unique build identifier
    buildHash: `buildhash${Date.now()}`,
    pkg,
    production,
    command,
    target: target || (production ? 'production' : 'development'),
    ...params,
    argv,
    ...loadProjectConfigs(configFiles, cwd),
  };

  //force production env
  if (env.production) {
    process.env.NODE_ENV = 'production';
  }

  function task(fn, options = {}) {
    return fn(g, options, env);
  }

  return {
    env,
    task,
    tasks(obj = {}) {
      return Object.entries(obj).reduce((acc, [name, fn]) => {
        acc[name] = Array.isArray(fn) ? task(...fn) : task(fn);
        return acc;
      }, {});
    },
    series: g.series,
    parallel: g.parallel,
  };
}

module.exports = config;
