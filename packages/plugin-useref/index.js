const { createPlugin, pipeChain, noopStream } = require('@wok-cli/core/utils');

function userefPlugin(stream, env, api, opts) {
  const useref = require('gulp-useref');
  const sourcemaps = require('gulp-sourcemaps');
  const conf = Object.assign(
    { sourcemaps: true, processAssets: noopStream },
    userefPlugin.transforms,
    opts,
  );

  conf.searchPath = conf.searchPath && api.pattern(conf.searchPath);
  conf.base = conf.base && api.resolve(conf.base);

  return stream
    .pipe(
      useref,
      conf,
      conf.sourcemaps &&
        pipeChain().pipe(
          sourcemaps.init,
          { loadMaps: true },
        ),
    )
    .pipe(
      conf.processAssets,
      conf,
    )
    .pipe(
      conf.sourcemaps
        ? () =>
            sourcemaps.write(
              typeof conf.sourcemaps === 'string' ? conf.sourcemaps : undefined,
            )
        : noopStream,
    );
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
