const getter = require('./build/get-task-delegator');
const delegator = require('./build/worker-task-delegator');
const base = require('./build/worker-delegator');
const constants = require('./build/constants');

module.exports = { ...getter, ...delegator, ...constants, ...base };
