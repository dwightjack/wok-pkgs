module.exports = (gulp, { pattern = [] }, env) => {
  return function clean() {
    const del = require('del');

    return del(env.pattern(pattern), { dot: true, allowEmpty: true });
  };
};
