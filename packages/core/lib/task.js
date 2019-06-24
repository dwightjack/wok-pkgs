const Config = require('./config');
const Hooks = require('./hooks');

module.exports = class Task extends Config {
  task(fn) {
    this.set('task', fn);
    return this;
  }
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
  hooks() {
    if (!this.has('hooks')) {
      this.set('hooks', new Hooks(this));
    }

    return this.get('hooks');
  }
  compose(fn) {
    this.isComposed = true;
    this.task(fn);
    return this;
  }
  hook(name, id, fn) {
    const hooks = this.hooks();

    if (!id) {
      return hooks.get(name);
    }

    hooks.tap(name, id, fn);
    return this;
  }
};
