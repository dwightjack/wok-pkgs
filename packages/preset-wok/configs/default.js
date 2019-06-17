module.exports = {
  paths: require('./paths'),
  modernizr: {
    options: ['setClasses', 'addTest', 'testProp'],
  },
  nunjucks: {
    root: ['<%= paths.src.views %>', '<%= paths.src.fixtures %>'],
  },
  lint: true,
};
