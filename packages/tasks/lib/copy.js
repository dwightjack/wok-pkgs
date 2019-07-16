const { createTask } = require('@wok-cli/core/utils');

module.exports = createTask('copy', { cache: true });
