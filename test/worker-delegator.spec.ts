import { describeClass, stub, expect, match, SinonStub } from "strict-unit-tests";
import { WorkerDelegator } from "../src/worker-delegator";
import { WorkerControl } from "../src/worker-control";
import { useFakeTimers, SinonFakeTimers } from 'sinon';

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
			stub(target, 'waitSomeWorker' as any).callsFake(async () => {
				if (count === 0) {
					workers.push({
						worker: 'something something',
						working: false,
					});
				} else {
					count--;
				}
			});
			(target as any).workers = workers = [];
			let count = 1;
		});

		it('should wait until a worker is available before delegate', async () => {
			const result = await target.delegate('some message');

			expect(target['waitSomeWorker']).to.have.callsLike([], []);
			expect(target['delegateWorkerMessage']).to.have.callsLike(
				['something something', 'some message'],
			);
			expect(result).to.be.undefined;
		});
	});

	describe('waitSomeWorker' as any, it => {
		beforeEach(() => {
			stub(target, 'once').callsFake((_event, resolve) => resolve());
		});

		it('should promisify once', async () => {
			const result = await target['waitSomeWorker']();

			expect(target['once']).to.have.callsLike(
				['message', match.func],
			);
			expect(result).to.be.undefined;
		});
	});

	describe('onIdle', () => {
		let waitSomeWorker: SinonStub;

		beforeEach(() => {
			waitSomeWorker = stub(target, 'waitSomeWorker' as any);
		});

		it('should do nothing if there is no worker', async () => {
			const result = await target.onIdle();

			expect(target['waitSomeWorker']).to.have.callsLike();
			expect(result).to.be.undefined;
		});

		it('should wait all workers to be idle', async () => {
			target['workers'].push({
				working: true,
			} as any);
			target['workers'].push({
				working: true,
			} as any);
			waitSomeWorker.callsFake(() => {
				const worker = target['workers'].find(x => x.working);
				worker!.working = false;
			});

			const result = await target.onIdle();

			expect(target['waitSomeWorker']).to.have.callsLike([], []);
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

	describe('getOnExit' as any, it => {
		let clock: SinonFakeTimers;

		beforeEach(() => {
			stub(target, 'emit');
			stub(target, 'createWorker' as any);
			clock = useFakeTimers(new Date());
		});

		afterEach(() => {
			clock.restore();
		});

		it('should return a function that emit "workerDied" event and create Worker again after the setted delay', async () => {
			target['rebornDelay' as any] = 10000;
			const workerControl: WorkerControl<any> = {
				worker: undefined,
				working: false,
			};

			const factory = target['getOnExit'](workerControl, 1);
			const promisedResult = factory();

			expect(target['emit']).to.have.callsLike(
				['workerDied', 1],
			);
			expect(target['createWorker']).to.have.callsLike();
			clock.tick(10000);
			const result = await promisedResult;
			expect(target['createWorker']).to.have.callsLike(
				[workerControl, 1],
			);
			expect(result).to.be.undefined;
		});
	});

	describe('getOnMessage' as any, it => {
		beforeEach(() => {
			stub(target, 'emit');
		});

		it('should return a function that emit "message" event', async () => {
			const workerControl: WorkerControl<any> = {
				worker: undefined,
				working: false,
			};

			const factory = target['getOnMessage'](workerControl);
			const result = factory('message value');

			expect(target['emit']).to.have.callsLike(
				['message', 'message value'],
			);
			expect(result).to.be.undefined;
		});
	});
});
