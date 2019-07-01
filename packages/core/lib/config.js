/**
 * Chainable configuration class.
 *
 * @name Config
 * @class
 * @param {Config} [parent] Parent instance
 * @param {function} [serializer=Config.toObject] A function used to serialize the instance.
 */
module.exports = class Config {
  /**
   * Recursively serializes a config into an object.
   *
   *
   * @static
   * @param {Config} config A config instance
   * @returns {object<string,*>}
   */
  static toObject(config) {
    return [...config.$store.entries()].reduce((acc, [key, value]) => {
      acc[key] = value instanceof Config ? value.toObject() : value;
      return acc;
    }, {});
  }

  /**
   * Serializes a config into an array.
   *
   * @static
   * @param {Config} config A config instance
   * @returns {any[]}
   */
  static toArray(store) {
    return [...store.values()];
  }

  /**   *
   * @constructor
   */
  constructor(parent, serializer = Config.toObject) {
    /**
     * Config serializer.
     *
     * @type {function}
     * @protected
     */
    this.$serializer = serializer;

    /**
     * Parent instance (optional).
     *
     * @type {Config}
     * @protected
     */
    this.$parent = parent;

    /**
     * Internal data storage.
     *
     * @type {Map}
     * @protected
     */
    this.$store = new Map();
  }

  /**
   * Creates a shorthand method to set a config property
   *
   * @param {string[]} keys Shorthand names
   * @example
   * const config = new Config();
   * config.shorthands(['name'])
   *
   * config.name('John')
   * // same as
   * config.set('name', 'John')
   */
  shorthands(keys) {
    keys.forEach((key) => {
      this[key] = (value) => this.set(key, value);
    });
  }

  /**
   * Returns a reference to the parent config.
   * Useful when using nested config and chaining
   *
   * @returns {Config}
   * @example
   * const config = new Config()
   * const child = new Config(config)
   *
   * config.set('child', new Config(config))
   *
   * config
   * .get('child')
   *  .set('childName', 'John')
   *  .end()
   * .set('parentName', 'Jack')
   *
   */
  end() {
    return this.$parent;
  }

  /**
   * Clears the internal data store.
   *
   * @return {Config} This method is chainable
   */
  clear() {
    this.$store.clear();
    return this;
  }

  /**
   * Deletes a specific key from the internal data store.
   *
   * @param {string} key
   * @return {Config} This method is chainable
   */
  delete(key) {
    this.$store.delete(key);
    return this;
  }

  /**
   * Checks if a specific key exists in the internal data store.
   *
   * @param {string} key
   * @return {Config} This method is chainable
   */
  has(key) {
    return this.$store.has(key);
  }

  /**
   * Returns the value of a key in the internal data store.
   *
   * @param {string} key
   * @return {Config} This method is chainable
   */
  get(key) {
    return this.$store.get(key);
  }

  /**
   * Sets the value of a key in the internal data store.
   *
   * @param {string} key
   * @param {*} value
   * @return {Config} This method is chainable
   */
  set(key, value) {
    this.$store.set(key, value);
    return this;
  }

  /**
   * Iterates over an object setting its key/value pairs into the internal store.
   *
   * @param {object<string,*>} obj
   * @return {Config} This method is chainable
   * @example
   * config.extend({ name: 'John' })
   * config.get('name') === 'John'
   */
  extend(obj) {
    Object.entries(obj).forEach(([key, value]) => {
      this.set(key, value);
    });
    return this;
  }

  /**
   * Serialize the instance and returns it.
   *
   * @see Config#$serializer
   * @return {*}
   */
  serialize() {
    return this.$serializer(this);
  }
};
