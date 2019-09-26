module.exports = (baseConfig) => ({
  ...baseConfig,
  paths: require('./paths'),
  lint: true,
  // write external sourcemaps just during development
  sourcemaps: !baseConfig.production && '.',
});
