# laravel-nodejs-redis-queue
Push Laravel jobs to redis queue from NodeJs App

## Install
```shell
npm i @lessmore/laravel-nodejs-redis-queue
```
```shell
pnpm i @lessmore/laravel-nodejs-redis-queue
```
```shell
yarn add @lessmore/laravel-nodejs-redis-queue
```

## Usage

Push `TestJob` to `default` queue:
```javascript
//app.js
import {createClient} from 'redis';
import {Queue, Job} from '@lessmore/laravel-nodejs-redis-queue'

const redis = createClient();

let laravel_queue = new Queue({
    client: redis,
    app_name: 'laravel_app',
    scope: {
        'App\\Jobs\\TestJob': Job
    }
});
let job = new Job({a: 'pushed from', b: 'nodejs'});
job.queue = 'default'
job.delay = 50
laravel_queue.push('App\\Jobs\\TestJob', job);
```

`TestJob` in Laravel:
```php
<?php

namespace App\Jobs; 
use Illuminate\Contracts\Queue\ShouldQueue;

class TestJob extends Job implements ShouldQueue
{
    public $a, $b;
    public function __construct ($a, $b) {
        $this->a = $a;
        $this->b = $b;
    }

    function handle () {
        \Log::info('TestJob ' . $this->a . ' '. $this->b);
    }
}
```
