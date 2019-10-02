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
  plugins: ['@babel/plugin-proposal-class-properties'],
};
