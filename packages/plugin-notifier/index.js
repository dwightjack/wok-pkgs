const { createPlugin, noopStream } = require('@wok-cli/core/utils');
const notifier = require('node-notifier');
const { promisify } = require('util');

const notifyAsync = promisify(notifier.notify.bind(notifier));

/**
 * A plugin to show desktop notifications to the user.
 *
 * @param {*} accumulator Hook accumulator
 * @param {object} env Wok environment configuration object
 * @param {object} api Wok internal API
 * @param {object} params Plugin parameters.
 * @param {string} [params.title] Notification title. Defaults to the `name` defined in the package.json
 * @param {string} [params.message] Notification message
 * @returns {*}
 */
function notify(accumulator, { pkg = {} }, api, { message, title }) {
  const config = {
    title: title || pkg.name || 'application',
    message,
    sound: false,
  };

  if (typeof accumulator.then === 'function') {
    return accumulator.then(() => notifyAsync(config));
  }

  if (typeof accumulator.pipe === 'function') {
    return accumulator.pipe(() => {
      notifier.notify(config);
      return noopStream();
    });
  }

  notifier.notify(config);
  return accumulator;
}

module.exports = createPlugin({
  name: 'notifier',
  test: ({ enableNotify }) => enableNotify !== false,
  plugin: notify,
});
