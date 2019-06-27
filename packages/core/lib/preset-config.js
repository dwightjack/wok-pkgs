const Config = require('./config');
const Task = require('./task');

module.exports = class PresetConfig extends Config {
  constructor(...args) {
    super(...args);
    this.$cbs = [];
    this.$config = {};
  }

  config(cfg) {
    if (cfg === undefined) {
      return this.$config;
    }
    Object.assign(this.$config, cfg);
    return this;
  }

  onResolve(fn) {
    this.$cbs.push(fn);
    return this;
  }

  compose(key, fn) {
    const task = this.set(key);
    task.compose(fn);
    return this;
  }

  default(taskFn) {
    this.$default = taskFn;
    return this;
  }

  set(key, value, params) {
    const conf = new Task(this);
    this.$store.set(key, conf);
    if (value) {
      conf.task(value);

      if (params) {
        conf.params(params);
      }

      return this;
    }
    return conf;
  }

  params(key, obj) {
    const task = this.get(key);
    if (!task) {
      throw new Error(`Task ${key} not registered!`);
    }
    if (obj) {
      task.params(obj);
      return this;
    }
    return task.params();
  }

  globalHook(...params) {
    const { api } = this.config();
    api.globalHooks.tap(...params);
    return this;
  }

  deleteGlobalHook(id, name) {
    const { api } = this.config();
    api.globalHooks.delete(id, name);
    return this;
  }

  resolve() {
    const cfg = this.config();
    const { task } = cfg;
    const tasks = {};

    if (typeof task !== 'function') {
      throw new Error('Task wrapper function not provided');
    }

    const composed = [];

    this.$store.forEach((taskCfg, name) => {
      const taskFn = taskCfg.get('task');
      const params = taskCfg.has('params')
        ? taskCfg.get('params').serialize()
        : {};

      if (taskFn && taskCfg.$isComposed) {
        composed.push({ name, fn: taskFn, params });
        return;
      }

      tasks[name] = task(taskFn, params, taskCfg.get('hooks'));
    });

    if (typeof this.$default === 'function') {
      tasks.default = this.$default(tasks);
    }

    composed.forEach(({ name, fn, params }) => {
      tasks[name] = fn(tasks, cfg, params);
    });

    this.$cbs.forEach((cb) => {
      cb(tasks, cfg);
    });

    return tasks;
  }
};
