/**
 * A Sharable task that does nothing.
 *
 * When executed completes with a resolved promise.
 *
 * @returns {function} Gulp tasks
 */
module.exports = () => {
  return function noop() {
    return Promise.resolve();
  };
};
