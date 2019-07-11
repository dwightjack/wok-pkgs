const { createPlugin } = require('@wok-cli/core/utils');
const notifier = require('node-notifier');
const { promisify } = require('util');

const notifyAsync = promisify(notifier.notify.bind(notifier));

function notify(promise, { pkg = {} }, api, { message, title }) {
  return promise.then(() => {
    return notifyAsync({
      title: title || pkg.name || 'application',
      message,
      sound: false,
    });
  });
}

module.exports = createPlugin({
  name: 'notifier',
  test: ({ enableNotify }) => enableNotify !== false,
  plugin: notify,
});
