const Config = require('./config');

module.exports = class PresetConfig extends Config {
  constructor(parent) {
    super(parent);
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

  compose(name, fn) {
    this.$cbs.push([name, fn]);
    return this;
  }

  default(taskFn) {
    this.$default = taskFn;
    return this;
  }

  set(key, value, params) {
    const conf = new Config(this);
    conf.set('task', value);
    this.$store.set(key, conf);

    if (params) {
      this.params(key, params);
    }

    return this;
  }

  params(key, obj) {
    const task = this.get(key);
    if (!task) {
      throw new Error(`Task ${key} not registered!`);
    }
    if (!task.has('params')) {
      task.set('params', new Config(this));
    }
    const params = task.get('params');
    if (obj) {
      params.extend(obj);
      return this;
    }
    return params;
  }

  hook(...params) {
    const { api } = this.config();
    api.hooks.tap(...params);
    return this;
  }

  deleteHook(id, name) {
    const { api } = this.config();
    api.hooks.delete(id, name);
    return this;
  }

  resolve() {
    const cfg = this.config();
    const { task } = cfg;
    const tasks = {};

    if (typeof task !== 'function') {
      throw new Error('Task wrapper function not provided');
    }

    this.$store.forEach((taskCfg, name) => {
      const taskFn = taskCfg.get('task');
      const params = taskCfg.has('params')
        ? taskCfg.get('params').toObject()
        : {};
      tasks[name] = task(taskFn, params);
    });

    if (typeof this.$default === 'function') {
      tasks.default = this.$default(tasks);
    }

    this.$cbs.forEach((cb) => {
      if (Array.isArray(cb)) {
        tasks[cb[0]] = cb[1](tasks, cfg);
        return;
      }
      cb(tasks, cfg);
    });

    return tasks;
  }
};
