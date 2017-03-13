import Queue, { PAUSE } from './queue';
import {
  each,
  noSuchMethod,
  noSuchQueue
} from './utils';

export default class DeferredActionQueues {
  public queues: {
    [name: string]: Queue
  };

  private queueNames: string[];

  private options: any;

  private queueNameIndex = 0;
  constructor(queueNames: string[], options: any) {
    let queues = this.queues = {};
    this.queueNames = queueNames = queueNames || [];

    this.options = options;

    each(queueNames, function(queueName) {
      queues[queueName] = new Queue(queueName, options[queueName], options);
    });
  }

  public schedule(name, target, method, args, onceFlag, stack) {
    let queues = this.queues;
    let queue = queues[name];

    if (!queue) {
      noSuchQueue(name);
    }

    if (!method) {
      noSuchMethod(name);
    }

    if (onceFlag) {
      return queue.pushUnique(target, method, args, stack);
    } else {
      return queue.push(target, method, args, stack);
    }
  }

  public flush() {
    let queue;
    let queueName;
    let numberOfQueues = this.queueNames.length;

    while (this.queueNameIndex < numberOfQueues) {
      queueName = this.queueNames[this.queueNameIndex];
      queue = this.queues[queueName];

      if (queue.hasWork() === false) {
        this.queueNameIndex++;
      } else {
        if (queue.flush(false /* async */) === PAUSE) {
          return PAUSE;
        }
        this.queueNameIndex = 0; // only reset to first queue if non-pause break
      }
    }
  }
}
