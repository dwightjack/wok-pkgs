const { getEnvTarget, resolveTemplate } = require('wok-core/utils');
const defaultCommands = require('./lib/commands');
const exec = require('./lib/exec');

module.exports = (gulp, params, env, api) => {
  return function ssh() {
    const target = getEnvTarget(env);
    const { command } = Object.assign(params, env.argv);
    if (target === false) {
      throw new Error(
        `[ssh]: Unable to retrieve an host for target ${env.target}`,
      );
    }

    if (!command) {
      throw new Error(`[ssh]: Command to execute not defined!`);
    }

    const commands = Object.assign({}, defaultCommands, params.commands);

    if (!commands[command]) {
      throw new Error(`Command "${command}" not defined`);
    }

    const parsed = resolveTemplate(commands[command], {
      env,
      src: api.resolve(params.src),
      target,
      excludes: params.excludes || [],
    });

    return exec(parsed, target);
  };
};
