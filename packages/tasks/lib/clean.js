/**
 * Sharable File Deletion Task
 *
 *
 * @param {Gulp} gulp Gulp instance
 * @param {object} params Task parameters
 * @param {string|string[]} params.pattern Globs matching files to delete. Matches dot files as well by default
 * @param {...*} params.* Every other parameter will be passed to [del](https://www.npmjs.com/package/del#options)
 * @param {object} env Wok environment object
 * @param {object} api Wok API object
 * @returns {function} Gulp tasks
 */
module.exports = (gulp, { pattern = [], ...params }, env, api) => {
  return function clean() {
    const del = require('del');

    return del(api.pattern(pattern), {
      dot: true,
      allowEmpty: true,
      ...params,
    });
  };
};
