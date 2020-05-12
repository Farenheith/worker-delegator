import lib = require('../src/task');

import { expect } from 'chai';

describe('thread.js', () => {
	it('should export all needed components for worker-task-delegator', () => {
		expect(lib.getTaskDelegator).to.exist;
	});
});
