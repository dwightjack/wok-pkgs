const {
  getEnvTarget,
  resolveTemplate,
  logger,
} = require('@wok-cli/core/utils');
const exec = require('./lib/exec');

/**
 * Sharable SSH Task
 *
 * @param {Gulp} gulp Gulp instance
 * @param {object} params Task parameters
 * @param {string} params.command Specific command to execute
 * @param {object} params.commands Map of executable commands
 * @param {string[]} [params.exclude=[]] Array of files to exclude (supports globs)
 * @param {object} env Wok environment object
 * @returns {function} Gulp tasks
 */
module.exports = (gulp, params, env) => {
  return function ssh() {
    const target = getEnvTarget(env);
    const { command } = Object.assign({}, params, env.argv);
    if (target === false) {
      throw new Error(
        `[ssh]: Unable to retrieve the configuration for target "${env.target}"`,
      );
    }

    if (target[command] === false) {
      logger.warn(
        `[ssh]: Command "${command}" not enabled on target "${env.target}"`,
      );
      return Promise.resolve();
    }

    if (!command) {
      throw new Error(`[ssh]: Command to execute not defined!`);
    }

    const commands = Object.assign({}, params.commands, env.commands);

    if (!commands[command]) {
      throw new Error(`[ssh]: Command "${command}" not defined`);
    }

    let commandTmpl = commands[command];

    const vars = {
      env,
      target,
      excludes: params.excludes || [],
    };

    if (commandTmpl.test) {
      const check = commandTmpl.test(target, env);
      if (!check || typeof check === 'string') {
        const errorMsg =
          typeof check === 'string'
            ? check
            : `Command pre-execution test failed for "${command}" on target "${env.target}"`;
        throw new Error(`[ssh]: ${errorMsg}`);
      }
      return exec(resolveTemplate(commandTmpl.exec, vars), target);
    }

    return exec(resolveTemplate(commandTmpl, vars), target);
  };
};
