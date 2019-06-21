const { logger } = require('../utils');

function getDeployTarget({ target, hosts }) {
  const targets = Object.keys(hosts).filter((host) => !!hosts[host].host);
  if (!target || targets.includes(target) === false) {
    logger.error(
      'ERROR: Deploy target unavailable. Specify it via `--target` argument. Allowed targets are: ' +
        targets.join(', '),
    );
    return false;
  }
  return hosts[target];
}

module.exports = (gulp, { src = '', ...params }, env, api) => {
  return function deploy() {
    const target = getDeployTarget(env);

    if (target === false) {
      throw new Error(
        `[deploy]: Unable to retrieve an host for target ${env.target}`,
      );
    }

    const { deployStrategy = env.deployStrategy } = target;
    const srcPath = api.resolve(src);

    return api.hooks.callWith(
      'deploy:strategy',
      Promise.resolve(),
      params['hooks:strategy'],
      { strategy: deployStrategy, target, src: srcPath },
    );
  };
};
