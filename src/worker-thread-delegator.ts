import { Worker, WorkerOptions } from 'worker_threads';
import { WorkerControl } from './worker-control';
import { WorkerDelegator } from './worker-delegator';

export const RELOAD_DELAY = 10000;

export class WorkerThreadDelegator<WorkerMessage> extends WorkerDelegator<Worker, WorkerMessage> {
  constructor(
		concurrency: number,
		private readonly workerCode: string,
		private readonly workerOptions: WorkerOptions = {},
		rebornDelay: number = RELOAD_DELAY,
  ) {
		super(concurrency, rebornDelay);
	}

	protected newWorkerInstance(workerIndex: number, workerControl: WorkerControl<Worker>) {
		const options = Object.assign({}, this.workerOptions);
		options.workerData = Object.assign({
			workerIndex,
		}, this.workerOptions.workerData);
		const worker = new Worker(this.workerCode, options);
    worker.on('exit', this.getOnExit(workerControl, workerIndex));
		worker.on('message', this.getOnMessage(workerControl));
		return worker;
	}

	protected delegateWorkerMessage(worker: Worker, message: WorkerMessage) {
		worker.postMessage(message);
	}
}
