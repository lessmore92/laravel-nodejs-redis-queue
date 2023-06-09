const Serialize = require('php-serialize');
const EventEmitter = require('events');
const crypto = require('crypto');

class Queue extends EventEmitter {
    constructor({
                    client,
                    scope = {},
                    queue = 'default',
                    app_name = 'laravel',
                    prefix = '_database_',
                    isQueueNotify = true,
                }) {
        super();
        this.client = client;
        this.isQueueNotify = isQueueNotify;
        this.scope = scope;
        this.app_name = app_name;
        this.prefix = prefix;
        this.queue = queue;
    }

    push(name, object, timeout = null, delay = null) {
        const command = Serialize.serialize(object, this.scope);
        const uuid = crypto.randomUUID();

        let data = {
            job: 'Illuminate\\Queue\\CallQueuedHandler@call',
            data: {
                commandName: name,
                command,
            },
            timeout: timeout,
            uuid: uuid,
            id: uuid,
            attempts: 0,
            delay: delay,
            maxExceptions: null,
        };
        if (this.isQueueNotify === false) {
            delete data.delay;
            delete data.maxExceptions;
            data = {
                ...data,
                displayName: name,
                maxTries: null,
                timeoutAt: null,
            };
        }

        this.client.rpush(this.app_name + this.prefix + 'queues:' + this.queue, JSON.stringify(data), (err, replay) => {
            // Queue pushed
        });
    }
}

class Job {
    constructor(obj) {
        this.job = null;
        this.connection = null;
        this.queue = null;
        this.chainConnection = null;
        this.chainQueue = null;
        this.delay = null;
        this.middleware = [];
        this.chained = [];

        if (obj) {
            Object.assign(this, obj);
        }
    }
}

module.exports = {
    Queue,
    Job,
};
