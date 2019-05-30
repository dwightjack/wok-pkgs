module.exports = (gulp, { pattern = [] }, env) => {
  const { resolvePath } = require('../utils');

  const folders = resolvePath(pattern, env);

  return function clean() {
    const del = require('del');

    return del(folders, { dot: true, allowEmpty: true });
  };
};
