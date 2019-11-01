const { getEnvTarget } = require('@wok-cli/core/utils');

/**
 * Sharable Deploy Task
 *
 * @param {Gulp} gulp Gulp instance
 * @param {object} params Task parameters
 * @param {string|string[]} params.src Source globs
 * @param {...*} params.* All other params will be passed to the strategy hook
 * @param {object} env Wok environment object
 * @param {object} api Wok API object
 * @returns {function} Gulp tasks
 */
module.exports = function(gulp, { src = '', ...params }, env, api) {
  const $hooks = this.getHooks();

  return function deploy() {
    const target = getEnvTarget(env);
    if (target === false) {
      throw new Error(
        `[deploy]: Unable to retrieve the configuration for target ${env.target}`,
      );
    }

    const { deployStrategy = env.deployStrategy } = target;

    return $hooks.callWith('strategy', Promise.resolve(), {
      ...params,
      src: api.resolve(src),
      strategy: deployStrategy,
      target,
    });
  };
};
