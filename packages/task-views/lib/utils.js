function matchParser(parsers) {
  return (ext) => parsers.find((p) => p.test.test(ext));
}

function matchEngine(engines) {
  const arr = [...engines.values()].map((createRenderer) => createRenderer());
  return (ext) => arr.find((p) => p.test.test(ext));
}

module.exports = { matchParser, matchEngine };
