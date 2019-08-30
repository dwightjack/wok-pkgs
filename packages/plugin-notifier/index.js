const { createPlugin, noopStream } = require('@wok-cli/core/utils');
const notifier = require('node-notifier');
const { promisify } = require('util');

const notifyAsync = promisify(notifier.notify.bind(notifier));

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
