module.exports = () => {
  return function noop() {
    return Promise.resolve();
  };
};
