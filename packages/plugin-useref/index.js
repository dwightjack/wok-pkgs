const { createPlugin } = require('wok-core/utils');

function userefPlugin(stream, env, api, opts) {
  const useref = require('gulp-useref');
  const gulpif = require('gulp-if');

  const conf = Object.assign({}, userefPlugin.transforms, opts);

  conf.searchPath = conf.searchPath && api.pattern(conf.searchPath);
  conf.base = conf.base && api.resolve(conf.base);

  return stream
    .pipe(
      useref,
      conf,
    )
    .pipe(() => gulpif('*.js', api.hooks.call('useref:js')))
    .pipe(() => gulpif('*.css', api.hooks.call('useref:css')));
}

userefPlugin.transforms = {
  replace: (blockContent, target, attrs) =>
    `<script src="${target}"${attrs ? ` ${attrs}` : ''}></script>`,
};

module.exports = createPlugin({
  name: 'useref',
  productionOnly: true,
  plugin: userefPlugin,
});
