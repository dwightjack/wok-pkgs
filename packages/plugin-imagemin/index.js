const { createPlugin } = require('wok-core/utils');

function imageMinPlugin(
  lazypipe,
  { production },
  api,
  { pattern = '**/*.{png,jpg,gif,svg,webp}', ...opts },
) {
  const filter = require('gulp-filter');
  const imagemin = require('gulp-imagemin');
  const f = filter(api.pattern(pattern), { restore: true });

  const plugins = [
    imagemin.svgo({
      plugins: [{ cleanupIDs: false }, { removeViewBox: false }],
    }),
  ];

  if (production) {
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
    .pipe(() => api.hooks.call('imagemin:after', opts))
    .pipe(() => f.restore);
}

module.exports = createPlugin({
  name: 'imagemin',
  plugin: imageMinPlugin,
});
