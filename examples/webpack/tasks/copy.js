module.exports = function cpyTask(gulp, { src, dest }) {
  return function copy() {
    return gulp.src(src).pipe(gulp.dest(dest));
  };
};
