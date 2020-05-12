const getter = require('./build/get-thread-delegator');
const delegator = require('./build/worker-thread-delegator');
const base = require('./build/worker-delegator');
const constants = require('./build/constants');

module.exports = { ...getter, ...delegator, ...constants, ...base };
