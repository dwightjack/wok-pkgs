module.exports = (gulp, { pattern = [] }, env, api) => {
  return function clean() {
    const del = require('del');

    return del(api.pattern(pattern), { dot: true, allowEmpty: true });
  };
};
