const { createPlugin, logger, resolveTemplate } = require('wok-core/utils');
const defaultCommands = require('./lib/commands');

function exec(command, { host, port = 22, password, username }) {
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
}

module.exports = createPlugin({
  name: 'rsync',
  plugin(promise, env, api, params, cfg) {
    if (cfg.strategy !== 'rsync') {
      return promise;
    }

    const { commands } = params;

    if (env.argv.rollback === true) {
    }

    return promise
      .then(function backupCommand() {
        const { target } = cfg;
        if (!target.backup) {
          throw new Error(
            'Backup folder not configured for host ' + target.host,
          );
        }

        const command = resolveTemplate(
          commands.backup || defaultCommands.backup,
          { ...env, ...cfg },
        );

        exec(command, target);
      })
      .then(function rsync() {});
  },
});
