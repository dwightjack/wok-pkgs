function loadProjectConfigs(pattern, cwd) {
  const glob = require('globby');
  const { join, basename } = require('path');

  const files = glob.sync(pattern, { cwd });

  const { locals, globals } = files.reduce(
    (acc, file) => {
      const mod = require(join(cwd, file));
      if (file.includes('.local.')) {
        acc.locals[file.replace('.local.', '')] = mod;
      } else {
        acc.globals[file] = mod;
      }
      return acc;
    },
    {
      locals: {},
      globals: {},
    },
  );

  return Object.entries(globals).reduce((acc, [key, globalConf]) => {
    const confKey = basename(key, '.js');
    const localConf = locals[key] || {};
    const conf =
      typeof localConf === 'function'
        ? localConf(globalConf)
        : { ...globalConf, ...localConf };
    acc[confKey] = conf;

    return acc;
  }, {});
}

function config(g, params = {}) {
  const readPkgUp = require('read-pkg-up');
  const { pkg } = readPkgUp.sync({ cwd });
  const { cwd = process.cwd(), configFiles = ['build/config/*.js'] } = params;

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

  return {
    task(fn, options = {}) {
      return fn(g, options, env);
    },
  };
}

module.exports = config;
