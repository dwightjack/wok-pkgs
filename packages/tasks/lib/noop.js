/**
 * A Sharable task that does nothing.
 *
 * When executed completes with a resolved promise.
 *
 * @returns {function} Gulp tasks
 */
module.exports = function(gulp, params) {
  const $hooks = this.getHooks();
  return function noop() {
    $hooks.callWith('complete', Promise.resolve(), params);
    return Promise.resolve();
  };
};
