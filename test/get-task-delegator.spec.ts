import * as lib from '../src/worker-task-delegator';

import { SinonStub, expect, stub } from 'strict-unit-tests';

import { WorkerDelegator } from '../src/worker-delegator';
import { getTaskDelegator } from '../src';

describe('.getTaskDelegator()', () => {
	let initialize: SinonStub;
	let bind: SinonStub;
	let delegatorInstance: WorkerDelegator<any, any>;

	beforeEach(() => {
		initialize = stub();
		bind = stub().returns('bound delegate method');

		delegatorInstance = {
			initialize,
			delegate: {
				bind,
			}
		} as any;
		stub(lib, 'WorkerTaskDelegator').returns(delegatorInstance);
	});

	it('should return a bound delegate method from a WorkerTaskDelegator instance', () => {
		const result = getTaskDelegator(123, 'workerCode' as any, 321);

		expect(lib.WorkerTaskDelegator).to.have.callsLike([123, 'workerCode', 321]);
		expect(initialize).to.have.callsLike([]);
		expect(bind).to.have.callsLike([delegatorInstance]);
		expect(result).to.be.eq('bound delegate method');
	});
});
