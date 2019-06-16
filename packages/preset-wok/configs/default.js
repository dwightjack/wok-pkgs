module.exports = {
  paths: require('./paths'),
  babel: {
    presets: [
      [
        '@babel/env',
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
  },
  modernizr: {
    options: ['setClasses', 'addTest', 'testProp'],
  },
  nunjucks: {
    root: ['<%= paths.src.views %>', '<%= paths.src.fixtures %>'],
  },
};
