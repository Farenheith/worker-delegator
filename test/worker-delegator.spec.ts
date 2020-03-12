import { describeClass, stub, expect } from "strict-unit-tests";
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
			expect(result);
		});
	});
})
