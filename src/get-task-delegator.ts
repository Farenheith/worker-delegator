import { Task, WorkerTaskDelegator } from './worker-task-delegator';

export function getTaskDelegator<T>(concurrency: number, workerCode: Task<T>, rebornDelay?: number) {
	const delegator = new WorkerTaskDelegator(concurrency, workerCode, rebornDelay);

	delegator.initialize();

	return delegator.delegate.bind(delegator);
}
