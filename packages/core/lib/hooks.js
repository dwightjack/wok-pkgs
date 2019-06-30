const { pipeChain, logger } = require('../utils');
const Config = require('./config');

/**
 * Hook implementation class.
 *
 * @name Hooks
 * @extends Config
 * @class
 */
module.exports = class Hooks extends Config {
  /**
   * Sets internal references for the environment and context.
   *
   * @param {object} env WOK-cli environment
   * @param {object} ctx A context object
   * @returns {Hooks} This method is chainable
   */
  bind(env, ctx) {
    /**
     * Internal environment reference.
     *
     * @type {object}
     * @property
     * @protected
     */
    this.$env = env;
    /**
     * Internal context reference.
     *
     * @type {object}
     * @property
     * @protected
     */
    this.$ctx = ctx;
    return this;
  }
  /**
   * Returns an hook map. If the hook does not exist it will be set.
   *
   * @param {string} id
   * @return {Map} The hook map
   */
  get(id) {
    if (!this.has(id)) {
      this.set(id);
    }
    return this.$store.get(id);
  }

  /**
   * Sets an hook map.
   *
   * @param {string} id
   * @returns {Hooks} This method is chainable
   */
  set(id) {
    this.$store.set(id, new Map());
    return this;
  }

  /**
   * Deletes an hook map or a specific hook by name.
   *
   * @param {string} id Hook map id
   * @param {string} [name] Hook name
   * @returns {Hooks} This method is chainable
   */
  delete(id, name) {
    if (!name) {
      this.$store.delete(id);
    } else {
      this.get(id).delete(name);
    }
    return this;
  }

  /**
   * Executes an hook with an initial value and optional parameters.
   *
   * @param {string} id Hook map id
   * @param {*} initial Hook initial value
   * @param {...*} [params] Optional parameters
   * @returns {lazypipe}
   * @example
   * hooks.tap('demo', 'add', (n) => n + 1)
   * hooks.tap('demo', 'multiply', (n) => n * 2)
   *
   * hooks.callWith('demo', 1) === 4 // (1 + 1) * 2
   */
  callWith(id, initial, ...params) {
    if (!this.has(id)) {
      return initial;
    }
    const { $env, $ctx } = this;
    const hookFns = [...this.get(id).values()];
    return hookFns.reduce((acc, fn) => fn(acc, $env, $ctx, ...params), initial);
  }

  /**
   * Executes an hook with a [lazypipe](https://github.com/OverZealous/lazypipe) as initial value and optional parameters.
   *
   * The resulting lazypipe will be run right away and the resulting stream returned.
   *
   * @param {string} id Hook map id
   * @param {...*} [params] Optional parameters
   * @returns {stream}
   * @example
   * const { src, dest } = require('gulp');
   * const concat = require('gulp-concat');
   *
   * hooks.tap('scripts', 'concat', (lazypipe) => lazypipe.pipe(concat));
   *
   * exports.scripts = function scripts() {
   *  return src(['src/*.js'])
   *  .pipe(hooks.call('scripts'))
   *  .pipe(dest('dist'))
   * }
   *
   */
  call(id, ...params) {
    return this.callWith(id, pipeChain(), ...params)();
  }

  /**
   * Enqueue a new function inside a hook.
   *
   * Every function will receive a value from the previous one and should return a new one.
   *
   * @param {string} id Hook name
   * @param {string} name Hook function name
   * @param {*} fn Hook function
   * @returns {Hooks} This method is chainable
   * @example
   *
   * hooks.tap('demo', 'add', (n = 1) => n + 1) // n == 1
   * hooks.tap('demo', 'multiply', (n) => n * 2) // n == 2
   *
   * hooks.callWith('demo', 1) // returns 4
   *
   * hooks.delete('demo', 'multiply')
   *
   * hooks.callWith('demo', 1) // returns 2
   */
  tap(id, name, fn) {
    this.get(id).set(name, fn);
    return this;
  }

  /**
   * Returns the number of hook functions currently enqueued for a given hook.
   *
   * @param {string} id Hook map id
   * @return {number}
   */
  count(id) {
    return this.get(id).size;
  }

  /**
   * Like `Hooks#tap` but prepends the function instead of enqueuing it.
   *
   * Accepts a 4th argument to specify a function before which to append the new one.
   *
   * @param {string} id Hook map id
   * @param {string} name function name
   * @param {function} fn hook function
   * @param {string} [before] optional function name to which prepend the new function
   * @returns {Hooks} This method is chainable
   * @example
   * // prepend before all
   * hooks.tap('demo', 'add', (n) => n + 1)
   * hooks.tap('demo', 'multiply', (n) => n * 2)
   * hooks.tapBefore('demo', 'substract', (n) => n - 1)
   *
   * hooks.callWith('demo', 1) // returns 2 (1 - 1 + 1) * 2
   *
   * // prepend before a spcific function
   * hooks.tap('demo', 'add', (n) => n + 1)
   * hooks.tap('demo', 'multiply', (n) => n * 2)
   * hooks.tapBefore('demo', 'substract', (n) => n - 2, 'multiply')
   *
   * hooks.callWith('demo', 1) // returns 0 (1 + 1 - 2) * 2
   */
  tapBefore(id, name, fn, before) {
    const pairs = [...this.get(id)];
    if (before) {
      const idx = pairs.findIndex((pair) => pair[0] === before);
      if (idx === -1) {
        logger.warn(`Unable to find hook "${name}" inside "${id}"`);
        return this;
      }
      pairs.splice(idx, 0, [name, fn]);
    } else {
      pairs.unshift([name, fn]);
    }
    this.set(id, pairs);

    return this;
  }
};
