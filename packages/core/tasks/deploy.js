const { getEnvTarget } = require('../utils');

module.exports = (gulp, { src = '', ...params }, env, api) => {
  return function deploy() {
    const target = getEnvTarget(env);
    if (target === false) {
      throw new Error(
        `[deploy]: Unable to retrieve an host for target ${env.target}`,
      );
    }

    const { deployStrategy = env.deployStrategy } = target;

    return api.hooks.callWith('deploy:strategy', Promise.resolve(), {
      ...params,
      src: api.resolve(src),
      strategy: deployStrategy,
      target,
    });
  };
};
