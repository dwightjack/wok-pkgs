const { task, series } = require('@wok-cli/core');

function cpyTask(gulp, { src, dest }) {
  return function copy() {
    return gulp.src(src).pipe(gulp.dest(dest));
  };
}

const copy = task(cpyTask, {
  src: 'src/**',
  dest: 'public',
});

exports.default = series(copy);
