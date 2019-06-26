const Config = require('./config');
const Hooks = require('./hooks');

module.exports = class Task extends Config {
  constructor(...args) {
    super(...args);
    this.shorthands(['task']);
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
  hooks(name, pairs) {
    if (!this.has('hooks')) {
      this.set('hooks', new Hooks(this));
    }
    const hooks = this.get('hooks');

    if (!name) {
      return hooks;
    }

    if (name) {
      hooks.set(name);
    }
    if (pairs === undefined) {
      return hooks.get(name);
    }

    pairs.forEach((pair) => {
      hooks.tap(name, ...pair);
    });
    return this;
  }
  compose(fn) {
    this.isComposed = true;
    this.task(fn);
    return this;
  }
  hook(name, id, fn) {
    const hooks = this.hooks();
    hooks.tap(name, id, fn);
    return this;
  }
};
