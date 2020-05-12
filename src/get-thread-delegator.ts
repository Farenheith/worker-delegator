import { WorkerOptions } from 'worker_threads';
import { WorkerThreadDelegator } from './worker-thread-delegator';

export function getThreadDelegator(concurrency: number, workerCode: string, workerOptions?: WorkerOptions, rebornDelay?: number) {
	const delegator = new WorkerThreadDelegator(concurrency, workerCode, workerOptions, rebornDelay);

	delegator.initialize();

	return delegator.delegate.bind(delegator);
}
