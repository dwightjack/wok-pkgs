const { createPlugin, logger } = require('@wok-cli/core/utils');

/**
 * A deploy plugin to upload files via ftp.
 *
 * Use this plugin with the deploy task of @wok-cli/tasks.
 *
 * @param {Promise} promise Hook accumulator
 * @param {object} env Wok environment configuration object
 * @param {object} api Wok internal API
 * @param {object} params Plugin parameters. Any property not listed here below will be merged into to the FTPS configuration object.
 * @param {string} params.src Source files to upload
 * @param {string} params.strategy Target deploy strategy
 * @param {object} params.target A deploy target object <#TODO: add link>
 * @returns {Promise}
 */
function lftpPlugin(promise, env, api, { src, strategy, target, ...options }) {
  if (/^(ftp|ftps|lftp)$/.test(strategy) === false) {
    return promise;
  }

  const FTPS = require('ftps');
  const hasbin = require('hasbin');

  if (!hasbin.sync('lftp')) {
    throw new Error(
      '[plugin-lftp] FTP: required `lftp` binary not found in PATH.',
    );
  }

  const ftps = new FTPS({
    escape: false,
    ...target,
    ...options,
  });

  return new Promise((resolve, reject) => {
    ftps
      .raw(
        `mirror -p --reverse --delete --verbose --ignore-time ${src} ${target.path}`,
      )
      .exec((err, { error, data }) => {
        if (error) {
          reject(error);
        } else {
          if (data.length === 0) {
            logger.warn('[plugin-lftp]: Nothing to sync');
          }
          resolve();
        }
      })
      .stdout.on('data', (res) => {
        res
          .toString()
          .trim()
          .split('\n')
          .forEach((line) => {
            logger.warn(`[plugin-lftp]: ${line.trim()}`);
          });
      });
  });
}

module.exports = createPlugin({
  name: 'lftp',
  params: (opts) => opts,
  plugin: lftpPlugin,
});
