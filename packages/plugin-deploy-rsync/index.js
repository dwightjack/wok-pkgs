const { createPlugin, logger } = require('@wok-cli/core/utils');

/**
 * A deploy plugin to upload files via rsync.
 *
 * Use this plugin with the deploy task of @wok-cli/tasks.
 *
 * @param {Promise} promise Hook accumulator
 * @param {object} env Wok environment configuration object
 * @param {object} api Wok internal API
 * @param {object} params Plugin parameters. Any property not listed here below will be merged into to the FTPS configuration object.
 * @param {string} params.src Source files to upload
 * @param {string[]} params.exclude Array of strings to exclude from syncing
 * @param {string} params.strategy Target deploy strategy
 * @param {object} params.target A deploy target host object <#TODO: add link>
 * @returns {Promise}
 */
function rsyncPlugin(
  promise,
  env,
  api,
  { src, exclude = [], strategy, target, ...options },
) {
  if (strategy !== 'rsync') {
    return promise;
  }

  const rsync = require('rsyncwrapper');
  const { username, port = 22, path, host } = target;

  const config = {
    src,
    dest: api.resolve(path),
    host: `${username}@${host}`,
    recursive: true,
    compareMode: 'checksum',
    delete: true,
    args: ['--verbose', '--progress', '--cvs-exclude'],
    exclude: api.pattern(exclude),
    port,
    ...options,
  };

  return promise.then(() => {
    new Promise((resolve, reject) => {
      rsync(config, (error, stdout, sterr, cmd) => {
        logger.msg('Running command ' + cmd);
        if (error) {
          // failed
          logger.error(error.message);
          reject(error);
        } else {
          logger.msg(stdout);
          resolve();
        }
      });
    });
  });
}

module.exports = createPlugin({
  name: 'rsync',
  params: (opts) => opts,
  plugin: rsyncPlugin,
});
