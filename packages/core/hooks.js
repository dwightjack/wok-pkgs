const { pipeChain } = require('./utils');

module.exports = class Hooks {
  constructor() {
    this.$hooks = new Map();
  }
  get(id) {
    if (!this.$hooks.has(id)) {
      this.set(id);
    }
    return this.$hooks.get(id);
  }
  set(id) {
    this.$hooks.set(id, new Map());
    return this;
  }
  call(id, ...params) {
    return this.callWith(id, pipeChain(), ...params);
  }

  callWith(id, initial, ...params) {
    if (!this.$hooks.has(id)) {
      return initial;
    }
    const hookFns = [...this.get(id).values()];
    const result = hookFns.reduce((acc, fn) => fn(acc, ...params), initial);
    if (result.pipe) {
      // it's a stream-like interface
      // let's execute it right await
      return result();
    }
    return result;
  }
  tap(id, name, fn) {
    return this.get(id).set(name, fn);
  }
};
