const Config = require('./config');
const Hooks = require('./hooks');

/**
 * Task configuration class
 *
 * @name Task
 * @class
 * @extends Config
 */

module.exports = class Task extends Config {
  constructor(...args) {
    super(...args);

    /**
     * Shorthand method for `this.set('task', fn)`.
     *
     * @name task
     * @memberof Task
     * @function
     * @instance
     * @param {function} fn Task function
     * @returns {Task} This method is chainable
     */
    this.shorthands(['task']);

    this.$private = false;
  }

  /**
   * Sets the task as private. Private tasks in presets are not exposed.
   *
   * @param {boolean} [toggle=true]
   * @returns {Task}
   */
  private(toggle = true) {
    this.$private = toggle;
    return this;
  }

  /**
   * Sets or return the task params.
   *
   * If obj is not defined it will return the params configuration instance.
   *
   * @see Config#extend
   * @param {object<string,*>} [obj] key/value params to set
   * @returns {Task|Params}
   * @example
   * task.params({ src: 'src/*.js'})
   * task.params().get('src') === 'src/*.js'
   */
  params(obj) {
    if (!this.has('params')) {
      this.set('params', new Config(this));
    }
    if (obj) {
      this.get('params').extend(obj);
      return this;
    }
    return this.get('params');
  }

  /**
   * Sets or returns the task hooks.
   *
   * Returned values:
   *
   * - Without parameters it will return the whole Hook configuration instance.
   * - If just `id` is set it will return that specific hook map.
   * - if `pairs` is set it will call `Hooks#tap` for every pair of [hookName, hookFn] and return `this`.
   *
   * @see Hooks
   * @param {string} [id] Hook id
   * @param {array[]} [pairs] An array of [hookName, hookFn] pairs
   * @returns {Hooks|Map|Task}
   * @example
   * task.hooks() instanceof Hooks === true
   * tasks.hooks('demo').count() === 0
   * tasks.hooks('demo', ['add', (n) => n + 1]); // returns tasks
   * tasks.hooks().callWith('demo', 1) === 2
   */
  hooks(id, pairs) {
    if (!this.has('hooks')) {
      this.set('hooks', new Hooks(this));
    }
    const hooks = this.get('hooks');

    if (!id) {
      return hooks;
    }

    if (id) {
      hooks.set(id);
    }
    if (pairs === undefined) {
      return hooks.get(id);
    }

    pairs.forEach((pair) => {
      hooks.tap(id, ...pair);
    });
    return this;
  }
  /**
   * Sets the task as _composed_.
   *
   * @param {function} fn
   * @returns {Task} This method is chainable
   */
  compose(fn) {
    /**
     * Flags a composed task.
     *
     * @property {boolean}
     * @public
     */
    this.$isComposed = true;
    this.task(fn);
    return this;
  }
  /**
   * Shorthand to `this.hooks().tap(...)`.
   *
   * @param {string} id Hook map id
   * @param {string} name Hook function name
   * @param {function} fn Hook function
   * @returns {Task} This method is chainable
   */
  hook(id, name, fn) {
    const hooks = this.hooks();
    hooks.tap(id, name, fn);
    return this;
  }
};
