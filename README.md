# worker-delegator

[![Build Status](https://travis-ci.com/Farenheith/worker-delegator.svg?branch=master)](https://travis-ci.com/Farenheith/worker-delegator)
[![codecov](https://codecov.io/gh/Farenheith/worker-delegator/branch/master/graph/badge.svg)](https://codecov.io/gh/Farenheith/worker-delegator)
[![Maintainability](https://api.codeclimate.com/v1/badges/d60f70425ca98939aacf/maintainability)](https://codeclimate.com/github/Farenheith/worker-delegator/maintainability)
[![Packages](https://david-dm.org/Farenheith/worker-delegator.svg)](https://david-dm.org/Farenheith/worker-delegator)
[![npm version](https://badge.fury.io/js/worker-delegator.svg)](https://badge.fury.io/js/worker-delegator)

This is a simple project to help delegate tasks for worker threads in a controled pace.

# How it works?

# Worker thread version

### IMPORTANT:
To use this option and you're using node 10, you need to run node with the option *--experimental-worker*, or this'll not work!

First, you get a instance of the delegator

```TypeScript
const delegator = new WorkerThreadDelegator(10, './build/my-delegated-source.js');

delegator.initialize();
```

We defined here a delegator that controls 10 workers that runs my-delegated-source.js.
This source code need to fulfill two requirements:
* It need to listen to *message* event in the *parentPort* object;
* It need to return one single message after the task completion with *parentPort.postMessage*

Where is a simple example of a valid source:

```TypeScript
import { parentPort } from 'worker_threads';

parentPort.on('message', (message: string) => {
    console.log(`Received ${message}`);

    parentPort.postMessage('Message received!');
});
```

Now, how to delegate the message? Like this:

```TypeScript
await delegator.delegate('my-message');
```

After all delegations, you may need to wait that all pending tasks are finished. You can do this with this line of code:

```TypeScript
await delegator.onIdle();
```

That's it!

The promise returned by delegate will resolve after the message is delegated, not when it is processed. That's how the delegation pace is controlled! awaiting this call, you can control the flow of your solution to wait a little in a processing, for example, when all the workers are busy!

# Promise version

You can also run a Promise version of this delegator, with the following code:
```TypeScript
const delegator = new WorkerTaskDelegator(10, async () => {
    console.log('my promised code');
    return 'result';
});

delegator.initialize();
```

The usability is the same, the only difference is that all control are made based on promises, not worker threads.

If you're using node 10 and you don't want to use --experimental-worker parameter when running node if you're using only this option. Just import directly this worker, like this:

```TypeScript
import { WorkerTaskDelegator } from 'worker-delegator/worker-task-delegator';
```

With it you avoid the importion of worker-threads module at all.
