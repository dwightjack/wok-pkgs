module.exports = {
  src: {
    root: 'application',
    vendors: 'application/vendors',
    views: 'application/views',
    fixtures: 'application/fixtures',
  },
  static: 'static',
  styles: 'assets/stylesheets',
  scripts: 'assets/javascripts',
  dist: {
    root: 'public',
    vendors: 'assets/vendors',
    revmap: 'assets/assets-map.json',
  },
  tmp: 'var/tmp',
  backup: 'var/backups',
};
