const { logger } = require('@wok-cli/core/utils');

/**
 * Execute a command with ssh2
 *
 * @private
 * @param {string} command Command to execute
 * @param {object} target Target host
 * @param {string} target.host Remote hostname
 * @param {string} target.username Login username
 * @param {string} target.password Login password
 * @param {number} [target.port=22] SSH port
 * @return {Promise}
 */
module.exports = function exec(
  command,
  { host, port = 22, password, username },
) {
  const { Client } = require('ssh2');
  const conn = new Client();

  return new Promise((resolve, reject) => {
    conn
      .on('ready', () => {
        conn.exec(command, (err, stream) => {
          if (err) {
            reject(err);
            return;
          }

          stream
            .on('close', (code) => {
              logger.msg(`REMOTE: close code: ${code}`);
              resolve();
              conn.end();
            })
            .on('data', (data) => {
              logger.msg('REMOTE: ' + data);
            })
            .stderr.on('data', (data) => {
              logger.error('REMOTE: ' + data);
            });
        });
      })
      .connect({
        host,
        port,
        password,
        username,
      });
  });
};
