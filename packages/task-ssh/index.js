const {
  getEnvTarget,
  resolveTemplate,
  logger,
} = require('@wok-cli/core/utils');
const exec = require('./lib/exec');

module.exports = (gulp, params, env) => {
  return function ssh() {
    const target = getEnvTarget(env);
    const { command } = Object.assign(params, env.argv);
    if (target === false) {
      throw new Error(
        `[ssh]: Unable to retrieve an host for target "${env.target}"`,
      );
    }

    if (target[command] === false) {
      logger.warn(
        `[ssh]: Command ${command} not enabled on target "${env.target}"`,
      );
      return Promise.resolve();
    }

    if (!command) {
      throw new Error(`[ssh]: Command to execute not defined!`);
    }

    const commands = Object.assign({}, params.commands, env.commands);

    if (!commands[command]) {
      throw new Error(`Command "${command}" not defined`);
    }

    let commandTmpl = commands[command];

    if (commandTmpl.test && commandTmpl.test(target, env) === true) {
      commandTmpl = commandTmpl.exec;
    }

    const parsed = resolveTemplate(commandTmpl, {
      env,
      target,
      excludes: params.excludes || [],
    });

    return exec(parsed, target);
  };
};
