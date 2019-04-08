module.exports = (gulp, { pattern = [] }, env) => {
  const { resolvePatterns } = require('../utils');

  const folders = resolvePatterns(pattern, env);

  return function clean() {
    const del = require('del');

    return del(folders, { dot: true, allowEmpty: true });
  };
};
