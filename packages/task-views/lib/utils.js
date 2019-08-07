/**
 * Returns a function to retrieve a parser object
 * matching a file extension with the `test` regexp of the parser
 *
 * @param {Map<string,object>} parsersMap Map of parsers
 * @returns {function}
 */
function matchParser(parsersMap) {
  const parsers = [...parsersMap.values()];
  return (ext) => parsers.find((p) => p.test.test(ext));
}

/**
 * Returns a function to match a view render engine based on a file extension.
 *
 * @param {Map<string,function>} engines Render engines
 * @returns {function}
 */
function matchEngine(engines) {
  const arr = [...engines.values()].map((createRenderer) => createRenderer());
  return (ext) => arr.find((p) => p.test.test(ext));
}

module.exports = { matchParser, matchEngine };
