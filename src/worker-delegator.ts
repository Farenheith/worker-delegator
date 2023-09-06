import { EventEmitter } from 'events';
import { RELOAD_DELAY } from './constants';
import { WorkerControl } from './worker-control';
import { WorkerEvents } from './worker-events';
import delay from 'delay';
import TypedEventEmitter from 'typed-emitter';

export abstract class WorkerDelegator<Worker, WorkerMessage> extends EventEmitter implements TypedEventEmitter<WorkerEvents> {
  private readonly workers: Array<WorkerControl<Worker>> = [];
	private waiting: Promise<unknown> | unknown;

  constructor(
		private readonly concurrency: number,
		private readonly rebornDelay: number = RELOAD_DELAY,
  ) {
		super();
	}

  initialize() {
    if (this.concurrency > 0) {
      this.workers.length = 0;

      for (let i = 0; i < this.concurrency; i++) {
        const workerControl = this.createWorker({} as WorkerControl<Worker>, i);
        this.workers.push(workerControl);
      }
			this.setMaxListeners(this.concurrency + 10);

      return true;
    }

    return false;
  }

  async delegate(message: WorkerMessage) {
    let idleWorker = this.workers.find((x) => !x.working);

    while (!idleWorker) {
      await this.waitSomeWorker();
      idleWorker = this.workers.find((x) => !x.working);
    }

    idleWorker.working = true;
    this.delegateWorkerMessage(idleWorker.worker, message);
  }

  private waitSomeWorker() {
		if (!this.waiting) {
    	this.waiting = new Promise((resolve) => this.once('message', resolve))
				.then(() => this.waiting = undefined);
		}
		return this.waiting;
  }

  async onIdle() {
		if (this.workers.length > 0) {
			while (this.workers.some(x => x.working)) {
				await this.waitSomeWorker();
			}
		}
  }

  private createWorker(workerControl: WorkerControl<Worker>, workerIndex: number) {
		workerControl.worker = this.newWorkerInstance(workerIndex, workerControl);
    workerControl.working = false;

		this.emit('workerBorn', workerIndex);
    return workerControl;
  }

	protected abstract newWorkerInstance(workerIndex: number, workerControl: WorkerControl<Worker>): Worker;
	protected abstract delegateWorkerMessage(worker: Worker, message: WorkerMessage): void;


  protected getOnExit(workerControl: WorkerControl<Worker>, index: number) {
    return async () => {
			this.emit('workerDied', index);
      await delay(this.rebornDelay);
      this.createWorker(workerControl, index);
    };
	}

  protected getOnMessage(workerControl: WorkerControl<Worker>) {
    return <TMessage>(message: TMessage) => {
      workerControl.working = false;
			this.emit('message', message);
    };
  }
}
