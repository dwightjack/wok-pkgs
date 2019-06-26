const { join } = require('path');

const Hooks = require('./lib/hooks');
const { resolvePath, resolvePatterns, loadProjectConfig } = require('./utils');

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

  const globalHooks = new Hooks();

  const api = {
    hooks: globalHooks,
    globalHooks,
    resolve: (src) => resolvePath(src, env),
    pattern: (patterns) => resolvePatterns(patterns, env),
  };

  globalHooks.bind(env, api);

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
    },
  };
}

module.exports = config;
