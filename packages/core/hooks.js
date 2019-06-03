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
  delete(id, name) {
    if (!this.$hooks.has(id)) {
      return this;
    }
    if (!name) {
      this.$hooks.delete(id);
      return this;
    }
    this.get(id).delete(name);
    return this;
  }
  call(id, ...params) {
    return this.callWith(id, pipeChain(), ...params);
  }
  callWith(id, initial, ...params) {
    let result = initial;
    if (this.$hooks.has(id)) {
      const hookFns = [...this.get(id).values()];
      result = hookFns.reduce((acc, fn) => fn(acc, ...params), initial);
    }

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

  tapBefore(id, name, fn, before) {
    const pairs = [...this.get(id)];
    if (before) {
      const idx = pairs.findIndex((pair) => pair[0] === before);
      if (idx === -1) {
        console.log(`Unable to find hook "${name}" inside "${id}"`);
        return this;
      }
      pairs.splice(idx, 0, [name, fn]);
    } else {
      pairs.unshift([name, fn]);
    }

    this.$hooks.set(id, new Map(pairs));
    return this;
  }
};
