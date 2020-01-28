function test(target, env) {
  if (target.backup && target.path) {
    return true;
  }
  return `both "backup" and "path" properties must be defined on target "${env.target}".`;
}

module.exports = {
  extends: ['@wok-cli/preset-standard/config'],
  commands: {
    backup: {
      test,
      exec:
        'mkdir -p <%= target.backup %>;' +
        'filecount=$(ls -t <%= target.backup %> | grep .tgz | wc -l);' +
        'if [ $filecount -gt 2 ];' +
        'then for file in $(ls -t <%= target.backup %> | grep .tgz | tail -n $(($filecount-2)));' +
        'do rm <%= target.backup %>/$file;' +
        'printf "Removing old backup file $file";' +
        'done;' +
        'fi;' +
        'if [ -d <%= target.path %> ]; then ' +
        'printf "Backup folder <%= target.path %> in <%= target.backup %>/backup-<%= new Date().getTime() %>.tgz";' +
        'tar -cpzf <%= target.backup %>/backup-<%= new Date().getTime() %>.tgz ' +
        '<%= excludes.map(function (exc) { return " --exclude=\'" + exc + "\'";}).join(" ") %> <%= target.path %>;' +
        'printf "Backup completed";' +
        'fi;',
    },
    rollback: {
      test,
      exec:
        'if [ -d <%= target.backup %> ];then ' +
        'rm -rf <%= target.path %>/*;' +
        'for file in $(ls -tr <%= target.backup %> | tail -n 1);' +
        'do tar -xzpf <%= target.backup %>/$file -C /;' +
        'done;' +
        'fi;',
    },
  },
};
