function noopMw(req, res, next) {
  next();
}

module.exports = {
  noopMw,
};
