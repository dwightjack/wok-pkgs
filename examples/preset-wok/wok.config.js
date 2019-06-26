const config = require('preset-wok/configs/default');

config.hosts = {
  staging: {
    host: '192.168.1.58',
    username: 'ftpuser',
    password: 'ftpuser',
    path: '/home/ftpuser/ftp/ssh_files',
    deployStrategy: 'rsync',
    backup: '/home/ftpuser/ftp/backups',
  },

  production: {
    host: '192.168.1.58',
    username: 'ftpuser',
    password: 'ftpuser',
    path: 'files',
    deployStrategy: 'ftp',
    backup: false,
  },
};

module.exports = config;
