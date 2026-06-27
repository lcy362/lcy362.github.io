---
title: "JStorm Source Code Analysis: Bolt Exception Handling"
description: "An analysis from source code perspective of the mechanism where uncaught exceptions in JStorm bolts cause worker process termination, revealing the complete design behind it."
keywords:
  - JStorm
  - bolt
  - exception handling
  - source code analysis
  - worker
tags:
  - jstorm
  - source-code-reading
abbrlink: 15594
cover: /img/bolt-exception.jpg
tldr: Understanding JStorm's ack mechanism and fail strategy is key
date: 2017-08-03 19:29:00
categories:
  - JStorm Source Code Analysis
---
## Problem

Anyone who has used Storm or JStorm knows that if an uncaught exception occurs in bolt code, the worker process will exit. This article analyzes the specific design from a source code perspective. It's actually not as simple as "an exception occurs and then the process crashes."

## The Truth

Let's first look at the source code of BasicBoltExecutor:
```java
    public void execute(Tuple input) {
        _collector.setContext(input);
        try {
            _bolt.execute(input, _collector);
            _collector.getOutputter().ack(input);
        } catch (FailedException e) {
            if (e instanceof ReportedFailedException) {
                _collector.reportError(e);
            }
            _collector.getOutputter().fail(input);
        }
    }
```
`_bolt.execute(input, _collector)` executes the `execute` method in our custom bolt. As you can see, only Storm's own `FailedException` is caught here, and a fail message is sent to mark the tuple as failed. All other exceptions are allowed to propagate.

The outer layer is the `processTupleEvent` method of BoltExecutors:
```java
        try {
            if (!isSystemBolt && tuple.getSourceStreamId().equals(Common.TOPOLOGY_MASTER_CONTROL_STREAM_ID)) {
                backpressureTrigger.handle(tuple);
            } else {
                bolt.execute(tuple);
            }
        } catch (Throwable e) {
            error = e;
            LOG.error("bolt execute error ", e);
            report_error.report(e);
        }
```
Here, all exceptions are caught, but only `report_error` is called — no fail message is sent. The related tuple can only be marked as failed after timing out.

Now let's look at the specific implementation of `report_error.report(e)`. From the constructor, we can see that `report_error` is a `TaskReportErrorAndDie` class:
```java
    @Override
    public void report(Throwable error) {
        this.reporterror.report(error);
        this.haltfn.run();
    }
```
Here, `reporterror` is an `AsyncLoopDefaultKill` class:
```java
    @Override
    public void run() {
        JStormUtils.halt_process(1, "Async loop died!");
    }
```
This is the final step of the entire process. The `JStormUtils.halt_process()` method prints an "Async loop died!" log message and then kills the worker process.

## Reflection

From the code, we can see that for JStorm, "worker exits after exception" is an intentionally designed feature, not a sign of program fragility. I speculate that the design philosophy here is: for known exceptions, developers catch them and re-throw `FailedException` to mark messages as failed; for unknown exceptions, the process is forced to exit directly, avoiding excessive catching that would mask problems.

However, while that may be the reasoning, I still have reservations about this design. After all, Storm differs from regular Java programs — Storm worker processes are automatically restarted after exiting, so this exception handling approach cannot achieve a fail-fast effect.

On the contrary, the continuous restarting of workers can bring about other problems. Furthermore, instead of actively marking messages as failed, waiting for a timeout — if the timeout is set too long (though an excessively long timeout is unreasonable in itself) — can also introduce issues. For example, with KafkaSpout, no new data will be fetched until a message has been acked. If one message has to wait for timeout, all data in the same partition cannot be processed during that timeout period.

From another perspective, if all exceptions were handled like `FailedException`, since data failures are visible after the exception, it wouldn't mask the problem either.

Therefore, I believe this handling logic still requires careful consideration.

Source: https://lichuanyang.top/en/posts/15594/
