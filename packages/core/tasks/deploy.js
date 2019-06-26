const { getEnvTarget } = require('../utils');

module.exports = function(gulp, { src = '', ...params }, env, api) {
  const $hooks = this.getHooks();

  return function deploy() {
    const target = getEnvTarget(env);
    if (target === false) {
      throw new Error(
        `[deploy]: Unable to retrieve an host for target ${env.target}`,
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
