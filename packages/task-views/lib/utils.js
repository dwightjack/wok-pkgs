const matchParser = (parsers) => {
  const arr = [...parsers.values()];
  return (ext) => arr.find((p) => p.test.test(ext));
};

const matchEngine = (engines) => {
  const arr = [...engines.values()].map((createRenderer) => createRenderer());
  return (ext) => arr.find((p) => p.test.test(ext));
};

module.exports = { matchParser, matchEngine };
