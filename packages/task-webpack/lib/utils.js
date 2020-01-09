function noopMw(req, res, next) {
  next();
}

const noop = () => {};

module.exports = {
  noopMw,
  noop,
};
