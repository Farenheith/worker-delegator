import { describeClass, stub, expect, match } from "strict-unit-tests";
import { WorkerDelegator } from "../src/worker-delegator";
import { WorkerControl } from "../src/worker-control";

class TestWorkerDelegator extends WorkerDelegator<unknown, unknown> {
	protected newWorkerInstance(workerIndex: number, workerControl: WorkerControl<any>) {
	}

	protected delegateWorkerMessage(worker: any, message: any): void {

	}
}

let target: TestWorkerDelegator;

function bootStrapper() {
	return target = new TestWorkerDelegator(3);
}


describeClass(TestWorkerDelegator, bootStrapper, describe => {
	describe('initialize', it => {
		beforeEach(() => {
			stub(target, 'createWorker' as any).callsFake((_p1, index) => `worker ${index}`);
		});

		it('should initialize the worker pool with the specified number of workers and return true, when concurrency is greater than 0', () => {
			const result = target.initialize();

			expect(target['createWorker']).callsLike(
				[{}, 0], [{}, 1], [{}, 2]
			);
			expect(result).to.be.true;
		});

		it('should do nothing and return false when concurrency is equals 0', () => {
			(target as any).concurrency  = 0;
			const result = target.initialize();

			expect(target['createWorker']).callsLike();
			expect(result).to.be.false;
		});
	});

	describe('delegate', it => {
		let workers: Array<WorkerControl<any>>;

		beforeEach(() => {
			stub(target, 'delegateWorkerMessage' as any);
			(target as any).workers = workers = [];
			let count = 1;
			stub(target, 'once').callsFake((_event, resolve) => {
				if (count === 0) {
					workers.push({
						worker: 'something something',
						working: false,
					});
				} else {
					count--;
				}
				resolve();
			});
		});

		it('should wait until a worker is available before delegate', async () => {
			const result = await target.delegate('some message');

			expect(target['once']).to.have.callsLike(
				['message', match.any],
				['message', match.any],
			);
			expect(target['delegateWorkerMessage']).to.have.callsLike(
				['something something', 'some message'],
			);
			expect(result).to.be.undefined;
		});
	});

	describe('createWorker' as any, it => {
		beforeEach(() => {
			stub(target, 'newWorkerInstance' as any).returns('worker instance');
			stub(target, 'emit');
		});

		it('should create new worker and fill worker control', () => {
			const workerControl: WorkerControl<any> = {
				info: 'WorkerControl instance',
			} as any;
			const workerIndex = 1919;

			const result = target['createWorker'](workerControl, workerIndex);

			expect(target['newWorkerInstance']).to.have.callsLike(
				[1919, workerControl],
			);
			expect(target['emit']).to.have.callsLike(
				['workerBorn', 1919],
			);
			expect(result).to.be.eq(workerControl);
			expect(workerControl).to.be.eql({
				info: 'WorkerControl instance',
				worker: 'worker instance',
				working: false,
			});
		});
	});
})
