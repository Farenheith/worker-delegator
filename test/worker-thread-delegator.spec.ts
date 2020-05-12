import * as workerThreads from 'worker_threads';

import { WorkerThreadDelegator } from '../src/worker-thread-delegator';
import { describeClass } from 'strict-unit-tests';
import { expect } from 'strict-unit-tests';
import { stub } from 'strict-unit-tests';

let target: WorkerThreadDelegator<any>;

function bootStrapper() {
	return target = new WorkerThreadDelegator<any>(
		3, 'worker-code', {
			resourceLimits: 'resourceLimits value' as any,
			workerData: {
				info: 'my-worker-data',
			},
		},
	);
}

describeClass(WorkerThreadDelegator, bootStrapper, describe => {
	describe.static('constructor' as any, () => {
		target = new WorkerThreadDelegator<any>(3, 'worker-code');

		expect(target['workerOptions']).to.be.eql({});
	});

	describe('delegateWorkerMessage' as any, it => {
		it('should run worker function', () => {
			const worker = {
				postMessage: stub(),
			};
			const message = 'message value';

			const result = target['delegateWorkerMessage'](worker as any, message);

			expect(worker.postMessage).to.have.callsLike([message]);
			expect(result).to.be.undefined;
		});
	});

	describe('newWorkerInstance' as any, it => {
		let worker: workerThreads.Worker;

		beforeEach(() => {
			stub(target, 'getOnMessage' as any).returns('getOnMessage result');
			stub(target, 'getOnExit' as any).returns('getOnExit result');
			worker = {
				on: stub(),
			} as any;
			stub(workerThreads, 'Worker').returns(worker);
		});

		it('should return a function that runs the workerCode and calls onMessage event', async () => {
			const workerControl = 'workerControl value';
			const workerIndex = 1;

			const result = target['newWorkerInstance'](workerIndex, workerControl as any);

			expect(workerThreads.Worker).to.have.callsLike(
				['worker-code', {
					resourceLimits: 'resourceLimits value',
					workerData: {
						info: 'my-worker-data',
						workerIndex: 1,
					}
				}]
			);
			expect(target['getOnExit']).to.have.callsLike(
				[workerControl, workerIndex],
			);
			expect(target['getOnMessage']).to.have.callsLike(
				[workerControl],
			);
			expect(worker.on).to.have.callsLike(
				['exit', 'getOnExit result'],
				['message', 'getOnMessage result'],
			)
			expect(result).to.be.eq(worker);
		});
	});
});
