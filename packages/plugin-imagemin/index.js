module.exports = ({ pattern = '**/*.{png,jpg,gif,svg,webp}' } = {}) => {
  return (lazypipe, env) => {
    const { resolvePatterns } = require('wok-core/utils');
    const filter = require('gulp-filter');
    const f = filter(resolvePatterns(pattern, env), { restore: true });
    const imagemin = require('gulp-imagemin');

    const plugins = [
      imagemin.svgo({
        plugins: [{ cleanupIDs: false }, { removeViewBox: false }],
      }),
    ];

    if (env.production) {
      plugins.push(
        imagemin.jpegtran({ progressive: false }),
        imagemin.gifsicle({ interlaced: true }),
        imagemin.optipng(),
      );
    }

    return lazypipe
      .pipe(() => f)
      .pipe(
        imagemin,
        plugins,
      )
      .pipe(() => f.restore);
  };
};
