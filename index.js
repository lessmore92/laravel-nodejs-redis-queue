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

    async push(name, object, timeout = null, delay = null) {
        const command = Serialize.serialize(object, this.scope);
        const uuid = crypto.randomUUID();

        let data = {
            uuid: uuid,
            displayName: name,
            job: 'Illuminate\\Queue\\CallQueuedHandler@call',
            maxTries: null,
            maxExceptions: null,
            failOnTimeout: false,
            backoff: null,
            timeout: timeout,
            retryUntil: null,
            data: {
                commandName: name,
                command,
            },
            id: uuid,
            attempts: 0,
            type: 'job',
            tags: [],
            silenced: false,
            pushedAt: (Date.now() / 1000).toString()
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

        if (!this.client.isOpen) {
            await this.client.connect();
        }

        this.client.rPush(this.app_name + this.prefix + 'queues:' + this.queue, JSON.stringify(data), (err, replay) => {
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
