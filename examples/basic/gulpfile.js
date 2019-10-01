const { task, series, api } = require('@wok-cli/core');

function cpyTask(gulp, { src, dest }) {
  return function copy() {
    return gulp.src(src).pipe(gulp.dest(dest));
  };
}

const copy = task(cpyTask, {
  src: 'src/**',
  dest: api.resolve('<%= paths.dest %>'),
});

exports.default = series(copy);
