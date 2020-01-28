module.exports = (preset, $) => {
  // 1. Delete the default scripts task
  preset.delete('scripts');

  // 2. Remove the scripts watcher
  preset
    .get('watch')
    .hooks()
    .delete('watchers', 'scripts');

  // 3. Set the webpack task
  preset
    .set('$webpack')
    .task(require('@wok-cli/task-webpack'))
    .params({
      entry: {
        application:
          './<%= paths.src.root %>/<%= paths.scripts %>/application.js',
      },
      outputFolder: '<%= paths.dist.root %>/<%= paths.scripts %>',
    })
    .hook('config:chain', 'babel', (config) => {
      // setup the babel loader
      config.module
        .rule('js')
        .test(/\.m?js$/)
        .use('babel')
        .loader('babel-loader');
      return config;
    });

  // 4. Prevent the minification task from parsing the bundle (webpack already does that for you):
  preset
    .get('$minifyJS')
    .params()
    .set('pattern', [
      '<%= paths.dist.root %>/<%= paths.dist.vendors %>/modernizr/*.js',
    ]);

  // 4. Redefine the scripts task to execute the webpack task
  // and ensure we don't run the task when the server is running (see 5.)
  preset.compose('scripts', ({ $webpack }) => {
    return (done) => {
      if ($.env.$$isServe) {
        done();
        return;
      }
      return $webpack(done);
    };
  });

  // 5. attach the webpack middleware to the server task
  // webpack will serve the compiled assets in development
  preset.onResolve(({ server, $webpack }) => {
    $webpack.asServeMiddleware(server);
  });
};
