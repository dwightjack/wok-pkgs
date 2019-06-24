module.exports.backup =
  'mkdir -p <%= target.backup %>;' +
  'filecount=$(ls -t <%= target.backup %> | grep .tgz | wc -l);' +
  'if [ $filecount -gt 2 ];' +
  'then for file in $(ls -t <%= target.backup %> | grep .tgz | tail -n $(($filecount-2)));' +
  'do rm <%= target.backup %>/$file;' +
  'printf "Removing old backup file $file";' +
  'done;' +
  'fi;' +
  'if [ -d <%= src %> ]; then ' +
  'printf "Backup folder <%= src %> in <%= target.backup %>/backup-<%= new Date().getTime() %>.tgz";' +
  'tar -cpzf <%= target.backup %>/backup-<%= new Date().getTime() %>.tgz ' +
  '<%= excludes.map(function (exc) { return " --exclude=\'" + exc + "\'";}).join(" ") %> <%= src %>;' +
  'printf "Backup completed";' +
  'fi;';

module.exports.rollback =
  'if [ -d <%= target.backup %> ];then ' +
  'rm -rf <%= src %>/;' +
  'for file in $(ls -tr <%= target.backup %> | tail -n 1);' +
  'do tar -xzpf <%= target.backup %>/$file;' +
  'done;' +
  'fi;';
