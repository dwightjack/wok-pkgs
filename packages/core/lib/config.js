module.exports = class Config {
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
  extend(obj) {
    Object.entries(obj).forEach(([key, value]) => {
      this.set(key, value);
    });
    return this;
  }

  toObject() {
    return [...this.$store.entries()].reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  }
};
