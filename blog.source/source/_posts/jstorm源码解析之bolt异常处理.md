---
title: jstorm源码解析之bolt异常处理
description: "从源码角度分析 JStorm bolt 中未捕获异常导致 worker 进程退出的机制，揭示背后的完整设计。"
tags:
  - jstorm
  - 源码阅读
abbrlink: 15594
date: 2017-08-03 19:29:00
categories: jstorm源码解析
---

## 问题
用过storm或者jstorm的都知道，如果在bolt代码中发生了没被catch住的异常，所在worker进程会退出。本文就从源码角度分析一下具体设计，其实并不是“有异常然后进程崩了”这么简单。
<!-- more -->

## 实质
我们先看BasicBoltExecutor的源码：
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
_bolt.execute(input, _collector) 就是执行我们自己编写的bolt里的excute方法。可以看到，在这里，只会catch storm自己定义的FailedException，并且发送fail消息，标记tuple处理失败， 其余异常则会被放过。

再外层是BoltExecutors的processTupleEvent方法：
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
在这里，所有异常都会被catch住，但是只会进行report_error，并不会发fail消息，相关tuple只能等超时才能被标记为失败。

再来看report_error.report(e) 的具体实现，通过看构造函数，可以看到report_error是一个TaskReportErrorAndDie类，
```java
    @Override
    public void report(Throwable error) {
        this.reporterror.report(error);
        this.haltfn.run();
    }
```
在这里，reporterror是一个AsyncLoopDefaultKill类
```java
    @Override
    public void run() {
        JStormUtils.halt_process(1, "Async loop died!");
    }
```
这里就是整个过程的最终步骤了， JStormUtils.halt_process()方法会打印一条"Async loop died!"的日志后将worker进程杀死。

## 思考
通过代码可以出来，对于jstorm，“异常后worker退出”是一个故意设计出的特性，并非程序不健壮。猜测这一块的设计理念就是对于已知异常，开发人员自己捕获并重新抛出FailedException，使相应消息失败；未知异常则强制使进程直接失败退出，避免过度的catch导致问题被掩盖。

不过虽然话是这么说，对这个设计还是持保留意见，毕竟storm和普通的java程序不一样，storm的worker进程在退出后是会自动被重启的，所以这种异常处理方式并不能起到failfast的效果。

相反，worker的持续重启，还会带来一些其他问题。再一个，不主动将消息标为失败，而是等超时，如果设置的超时时间过长(当然超时时间太长也不合理)，也会引入一些问题。比如说kafkaSpout, 一条消息没被ack之前是不会继续取后边的数据的，这样如果有一条数据需要等超时，同分区下的数据在这一个超时周期内，就都无法被处理了。

从另一方面来说，如果像FailedException一样处理其他所有异常，由于异常之后可以看到有数据fail,也并不会掩盖问题。

所以说，这一块的处理逻辑，个人感觉还是需要斟酌一下。