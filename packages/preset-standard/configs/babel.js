module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        loose: true,
        useBuiltIns: false,
      },
    ],
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
  ],
};
