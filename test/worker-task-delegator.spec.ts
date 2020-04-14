import { expect } from 'strict-unit-tests';
import { stub, SinonStub } from 'strict-unit-tests';
import { WorkerTaskDelegator } from './../src/worker-task-delegator';
import { describeClass } from 'strict-unit-tests';

let target: WorkerTaskDelegator<any>;
let workerCode: any;

function bootStrapper() {
	workerCode = () => 1;
	return target = new WorkerTaskDelegator<any>(3, workerCode);
}

describeClass(WorkerTaskDelegator, bootStrapper, describe => {
	describe('delegateWorkerMessage' as any, it => {
		it('should run worker function', () => {
			const message = 'message value';
			const worker = stub();

			const result = target['delegateWorkerMessage'](worker as any, message);

			expect(worker).to.have.callsLike([message]);
			expect(result).to.be.undefined;
		});
	});

	describe('newWorkerInstance' as any, it => {
		let onMessage: SinonStub;

		beforeEach(() => {
			onMessage = stub();
			stub(target, 'getOnMessage' as any).returns(onMessage);
			stub(target, 'workerCode' as any).returns('workerCode result');
		});

		it('should return a function that runs the workerCode and calls onMessage event', async () => {
			const workerControl = 'workerControl value';
			const workerIndex = 1;

			const factory = target['newWorkerInstance'](workerIndex, workerControl as any);
			const result = await factory('message value');

			expect(target['getOnMessage']).to.have.callsLike(
				[workerControl],
			);
			expect(target['workerCode']).to.have.callsLike(
				['message value', 1],
			);
			expect(onMessage).to.have.callsLike(
				['workerCode result'],
			);
			expect(result).to.be.undefined;
		});
	});
});
