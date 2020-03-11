import { Worker, WorkerOptions } from 'worker_threads';
import { EventEmitter } from 'tsee';
import delay from 'delay';

export const RELOAD_DELAY = 10000;

export interface WorkerControl {
  worker: Worker;
  working: boolean;
}

// tslint:disable-next-line: interface-over-type-literal
export type WorkerEvents = {
	message: <TMessage>(message: TMessage) => Promise<unknown> | void,
	workerBorn: (index: number) => Promise<unknown> | void,
	workerDied: (index: number) => Promise<unknown> | void,
}

export class WorkerDelegator<WorkerMessage> extends EventEmitter<WorkerEvents> {
  private readonly workers: WorkerControl[] = [];

  constructor(
		private readonly concurrency: number,
		private readonly workerCode: string,
		private readonly workerOptions: WorkerOptions,
		private readonly rebornDelay: number = RELOAD_DELAY,
  ) {
		super();
	}

  initialize() {
    if (this.concurrency > 0) {
      this.workers.length = 0;

      for (let i = 0; i < this.concurrency; i++) {
        const workerControl = this.createWorker({} as WorkerControl, i);
        this.workers.push(workerControl);
      }

      return true;
    }

    return false;
  }

  async delegate(message: WorkerMessage) {
    let idleWorker = this.workers.find((x) => !x.working);

    while (!idleWorker) {
      await new Promise((resolve) => this.once('message', resolve));
      idleWorker = this.workers.find((x) => !x.working);
    }

    idleWorker.working = true;
    idleWorker.worker.postMessage(message);
  }

  private createWorker(workerControl: WorkerControl, workerIndex: number) {
		const options = Object.assign({}, this.workerOptions);
		options.workerData = Object.assign({
			workerIndex,
		}, this.workerOptions.workerData);

    workerControl.worker = new Worker(this.workerCode, options);
    workerControl.working = false;
    workerControl.worker.on('exit', this.getOnExit(workerControl, workerIndex));
    workerControl.worker.on('message', this.getOnMessage(workerControl, workerIndex));

		this.emit('workerBorn', workerIndex);
    return workerControl;
  }

  private getOnExit(workerControl: WorkerControl, index: number) {
    return async () => {
			this.emit('workerDied', index);
      await delay(this.rebornDelay);
      this.createWorker(workerControl, index);
    };
  }

  private getOnMessage(workerControl: WorkerControl, index: number) {
    return async <TMessage>(message: TMessage) => {
      workerControl.working = false;
			this.emit('message', message);
    };
  }
}
