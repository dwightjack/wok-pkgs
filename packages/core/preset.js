class Config {
  constructor(parent) {
    this.parent = parent;
    this.$store = new Map();
  }
  end() {
    return this.parent;
  }
  clear() {
    this.$store.clear();
    return this;
  }
  delete(key) {
    this.$store.delete(key);
    return this;
  }
  has(key) {
    return this.$store.has(key);
  }
  get(key) {
    return this.$store.get(key);
  }
  set(key, value) {
    this.$store.set(key, value);
    return this;
  }

  toObject() {
    return [...this.$store.entries()].reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  }
}

class PresetConfig extends Config {
  constructor(parent) {
    super(parent);
    this.$cbs = [];
    this.$hooks = new Map();
    this.$config = {};
  }

  config(cfg) {
    if (cfg === undefined) {
      return this.$config;
    }
    Object.assign(this.$config, cfg);
    return this;
  }

  callback(fn) {
    this.$cbs.push(fn);
    return this;
  }

  default(taskFn) {
    this.$default = taskFn;
    return this;
  }

  set(key, value) {
    const conf = new Config(this);
    conf.set('task', value);
    this.$store.set(key, conf);
    return this;
  }

  params(key) {
    const task = this.get(key);
    if (!task) {
      throw new Error(`Task ${key} not registered!`);
    }
    if (!task.has('params')) {
      task.set('params', new Config(this));
    }
    return task.get('params');
  }

  hook(...params) {
    const { env } = this.config();
    env.hooks.tap(...params);
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

    this.$cbs.forEach((fn) => fn(tasks, cfg));

    return tasks;
  }
}

function createPreset(cfg) {
  const preset = new PresetConfig();
  preset.config(cfg);
  return preset;
}

module.exports = { PresetConfig, createPreset };
