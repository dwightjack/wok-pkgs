module.exports = class Config {
  static toObject(store) {
    return [...store.entries()].reduce((acc, [key, value]) => {
      acc[key] = value instanceof Config ? value.toObject() : value;
      return acc;
    }, {});
  }

  static toArray(store) {
    return [...store.values()];
  }

  constructor(parent, serializer = Config.toObject) {
    this.$serializer = serializer;
    this.parent = parent;
    this.$store = new Map();
  }

  shorthands(keys) {
    keys.forEach((key) => {
      this[key] = (value) => this.set(key, value);
    });
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

  serialize() {
    return this.$serializer(this.$store);
  }
};
