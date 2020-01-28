const Config = require('./config');
const Task = require('./task');

/**
 * Workflow Preset configuration
 *
 * @name PresetConfig
 * @extends Config
 */
module.exports = class PresetConfig extends Config {
  constructor(...args) {
    super(...args);

    /**
     * Functions to be called after the configuration has been resolved
     * @private
     * @type {function[]}
     */
    this.$cbs = [];

    /**
     * Internal configuration
     * @type {object}
     * @private
     */
    this.$config = {};
  }

  /**
   * Extends the internal configuration object.
   * If `cfg` is undefined will return the internal configuration.
   *
   * @param {Object<string,*>} [cfg] Configuration object
   * @returns {object|PresetConfig}
   * @example
   * const preset = new PresetConfig();
   *
   * preset.config({ production: true });
   * preset.config().production === true
   */
  config(cfg) {
    if (cfg === undefined) {
      return this.$config;
    }
    Object.assign(this.$config, cfg);
    return this;
  }

  /**
   * Loads multiple presets.
   *
   * @param {string[]} presets List of paths to presets
   * @returns {PresetConfig}
   */
  use(presets = []) {
    const config = this.config();
    for (let p of presets) {
      require(p)(this, config);
    }

    return this;
  }

  /**
   * Enqueues a function to be executed after the `resolve()` method has completed.
   *
   * @param {function} fn Function to enqueue. Receives the resolved tasks object and the internal config as arguments.
   * @returns {PresetConfig}
   * @example
   * const preset = new PresetConfig();
   * preset.onResolve((tasks, config) => {
   *  // config === preset.config()
   * })
   */
  onResolve(fn) {
    this.$cbs.push(fn);
    return this;
  }

  /**
   * Adds a new composed task.
   *
   * @see Task#compose
   * @param {string} taskName Task name
   * @param {function} fn
   * @returns {PresetConfig}
   */
  compose(taskName, fn) {
    const task = this.set(taskName);
    if (taskName.startsWith('$')) {
      task.private(true);
    }
    task.compose(fn);
    return this;
  }

  /**
   * Sets the default task as a composed-like task.
   *
   * @param {function} taskFn Receives the resolved tasks object and the internal configuration as arguments.
   * @returns {PresetConfig}
   */
  default(taskFn) {
    this.$default = taskFn;
    return this;
  }

  /**
   * Sets a task with parameters.
   * If just `taskName` is passed it will return a chainable instance of `Task`.
   *
   * @see Task
   * @param {string} taskName Task name
   * @param {function} [fn] Task function
   * @param {object<string,*>} [params] Task parameters
   * @returns {PresetConfig|Task}
   * @example
   * const { copy } = require('@wok-cli/core/tasks');
   * preset.set('copy', copy, { src: ['src/*.html'] })
   *
   * // equivalent to
   * preset.set('copy')
   *  .task(copy)
   *  .params({ src: ['src/*.html'] })
   *  .end()
   */
  set(taskName, fn, params) {
    const conf = new Task(this);
    this.$store.set(taskName, conf);

    // task with a name starting with `$` are considered private by convention.
    if (taskName.startsWith('$')) {
      conf.private(true);
    }

    if (fn) {
      conf.task(fn);

      if (params) {
        conf.params(params);
      }

      return this;
    }
    return conf;
  }

  /**
   * Sets or returns a task params. If `obj` is undefined will return the task parameters as a `Config` instance.
   *
   * @param {string} taskName Task name
   * @param {object<string,*>} [obj] Parameters
   * @returns {Config|PresetConfig}
   */
  params(taskName, obj) {
    const task = this.get(taskName);
    if (!task) {
      throw new Error(`Task ${taskName} not registered!`);
    }
    if (obj) {
      task.params(obj);
      return this;
    }
    return task.params();
  }

  /**
   * Sets a global hook.
   *
   * @see Hooks#tap
   * @param {string} id Hook name
   * @param {string} name Hook function name
   * @param {function} fn Hook function
   * @returns {PresetConfig}
   */
  globalHook(...params) {
    const { api } = this.config();
    api.globalHooks.tap(...params);
    return this;
  }

  /**
   * Removes a global hook.
   *
   * @see Hooks#delete
   * @param {string} id Hook name
   * @param {string} name Hook function name
   * @returns {PresetConfig}
   */
  deleteGlobalHook(id, name) {
    const { api } = this.config();
    api.globalHooks.delete(id, name);
    return this;
  }

  /**
   * Parses the configuration and returns the resolved tasks in an exportable object.
   *
   * @returns {Object<string,function>}
   */
  resolve() {
    const cfg = this.config();
    const { task } = cfg;
    const tasks = {};
    const allTasks = {};

    if (typeof task !== 'function') {
      throw new Error('Task wrapper function not provided');
    }

    const composed = [];

    this.$store.forEach((taskCfg, name) => {
      const taskFn = taskCfg.get('task');
      const params = taskCfg.has('params')
        ? taskCfg.get('params').serialize()
        : {};
      const hooks = taskCfg.get('hooks');

      if (taskFn && taskCfg.$isComposed) {
        composed.push({
          name,
          fn: taskFn.bind({ getHooks: () => hooks }),
          params,
          $private: taskCfg.$private,
        });
        return;
      }

      const computedTask = task(taskFn, params, hooks);

      Object.defineProperty(computedTask, 'name', {
        value: name,
      });

      allTasks[name] = computedTask;

      if (!taskCfg.$private) {
        tasks[name] = computedTask;
      }
    });

    if (typeof this.$default === 'function') {
      allTasks.default = tasks.default = this.$default(allTasks, cfg);
    }

    composed.forEach(({ name, fn, params, $private }) => {
      const res = fn(allTasks, cfg, params);

      Object.defineProperty(res, 'name', {
        value: name,
      });

      allTasks[name] = res;

      if (!$private) {
        tasks[name] = res;
      }
    });

    this.$cbs.forEach((cb) => {
      cb(allTasks, cfg);
    });

    return tasks;
  }
};
