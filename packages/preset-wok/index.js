module.exports = (preset, $) => {
  const { deploy } = require('@wok-cli/tasks');
  const { getEnvTarget, runif } = require('@wok-cli/core/utils');
  const ssh = require('@wok-cli/task-ssh');
  const rsync = require('@wok-cli/plugin-deploy-rsync');
  const lftp = require('@wok-cli/plugin-deploy-lftp');

  preset
    .globalHook('watcher', 'notifier', require('@wok-cli/plugin-notifier'))
    .params('watch', {
      notifier: {
        message: 'Updated!',
      },
    })
    .set('remote', ssh)
    .set('$backup', ssh, { command: 'backup' })
    .set('$sync')
    .task(deploy)
    .params({
      src: '<%= paths.dist.root %>/',
      exclude: ['.svn*', '.tmp*', '.idea*', '.sass-cache*', '*.sublime-*'],
    })
    .hook('strategy', 'rsync', rsync)
    .hook('strategy', 'lftp', lftp)
    .end()
    .set('deploy')
    .compose((tasks) => {
      function test() {
        const target = getEnvTarget($.env);
        const { deployStrategy = $.env.deployStrategy } = target;
        return deployStrategy && deployStrategy !== 'ftp';
      }

      return $.series(tasks.default, runif(test, tasks.$backup), tasks.$sync);
    });
};
