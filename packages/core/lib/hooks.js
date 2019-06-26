const { pipeChain, logger } = require('../utils');
const Config = require('./config');

module.exports = class Hooks extends Config {
  bind(env, ctx) {
    this.$env = env;
    this.$ctx = ctx;
  }
  get(id) {
    if (!this.has(id)) {
      this.set(id);
    }
    return this.$store.get(id);
  }
  set(id) {
    this.$store.set(id, new Map());
    return this;
  }
  delete(id, name) {
    if (!name) {
      this.$store.delete(id);
    } else {
      this.get(id).delete(name);
    }
    return this;
  }
  call(id, ...params) {
    return this.callWith(id, pipeChain(), ...params);
  }
  callWith(id, initial, ...params) {
    let result = initial;
    const { $env, $ctx } = this;
    if (this.has(id)) {
      const hookFns = [...this.get(id).values()];
      result = hookFns.reduce(
        (acc, fn) => fn(acc, $env, $ctx, ...params),
        initial,
      );
    }

    if (result && result.pipe) {
      // it's a stream-like interface
      // let's execute it right await
      return result();
    }
    return result;
  }
  tap(id, name, fn) {
    this.get(id).set(name, fn);
    return this;
  }

  count(id) {
    return this.get(id).size;
  }

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
