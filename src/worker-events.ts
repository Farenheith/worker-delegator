// tslint:disable-next-line: interface-over-type-literal
export type WorkerEvents = {
	message: <TMessage>(message: TMessage) => Promise<unknown> | void;
	workerBorn: (index: number) => Promise<unknown> | void;
	workerDied: (index: number) => Promise<unknown> | void;
};
