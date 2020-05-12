import { RELOAD_DELAY } from './constants';
import { WorkerControl } from './worker-control';
import { WorkerDelegator } from './worker-delegator';

export type Task<WorkerMessage> = (message: WorkerMessage, index: number) => PromiseLike<unknown>;
export type Worker<WorkerMessage> = (message: WorkerMessage) => PromiseLike<unknown>;

export class WorkerTaskDelegator<WorkerMessage> extends WorkerDelegator<Worker<WorkerMessage>, WorkerMessage> {
  constructor(
		concurrency: number,
		private readonly workerCode: Task<WorkerMessage>,
		rebornDelay: number = RELOAD_DELAY,
  ) {
		super(concurrency, rebornDelay);
	}

	protected newWorkerInstance(workerIndex: number, workerControl: WorkerControl<Worker<WorkerMessage>>) {
		const onMessage = this.getOnMessage(workerControl);

		return async (message: WorkerMessage) => {
			const result = await this.workerCode(message, workerIndex);
			onMessage(result);
		};
	}

	protected delegateWorkerMessage(worker: Worker<WorkerMessage>, message: WorkerMessage) {
		worker(message);
	}
}
