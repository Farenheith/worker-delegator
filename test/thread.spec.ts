import lib = require('../src/thread');

import { expect } from 'chai';

describe('thread.js', () => {
	it('should export all needed components for worker-thread-delegator', () => {
		expect(lib.getThreadDelegator).to.exist;
	});
});
