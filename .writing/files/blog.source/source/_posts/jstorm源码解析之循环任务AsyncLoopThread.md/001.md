---
title: jstorm源码解析之循环任务AsyncLoopThread
description: "JStorm 自定义循环任务工具 AsyncLoopThread 的源码解析，了解 supervisor/nimbus 心跳等功能的底层实现。"
keywords:
  - JStorm
  - AsyncLoopThread
  - 源码分析
  - 循环任务
tags:
  - jstorm
categories:
  - jstorm源码解析
abbrlink: 31761
cover: /img/async-loop.jpg
date: 2018-02-08 16:17:37
---
## 概述
AsyncLoopThread是jstorm里自定义的一个循环执行任务的工具，实现不复杂，本来是不值当的专门开一篇文章介绍。不过这个在jstorm里应用实在太广泛了，诸如uspervisor/nimbus心跳,获取新topology,更新worker状态等大量功能都是利用AsyncLoopThread实现的，所以还是介绍一下吧，也方便后续看其他部分代码。
<!-- more -->

## 使用
AsyncLoopThread其实完全可以拿出来用在我们自己的工程里，使用比较方便，可以参考 https://github.com/lcy362/Scenes/blob/4d8ec4ff166060cf5d491c33a96f5c86e8389333/src/main/java/com/mallow/jstormcode/AsyncLoop.java

只需要先定义一个RunnableCallback类，RunnableCallback是jstorm里封装的一个线程类，对Runable接口做了一些增强，可以回调，可以主动关闭。

```java
public class TestThread extends RunnableCallback {
    @Override
    public void run() {
        System.out.println("thread runs " + new Date());
    }

    @Override
    public Object getResult() {
        return 10;
    }

}
```

这里我们只实现了两个方法，run和getResult, 其中，run方法就是线程执行方法，和一般的线程一样的，getResult返回的是任务执行间隔时间，单位是秒。

之后我们只要把这个TestThread作为一个参数传给AsyncLoopThread，就可以实现循环执行TestThread的run方法了。

```java
public static void main(String args[]) {
        AsyncLoopThread loop = new AsyncLoopThread(new TestThread());

        try {
            TimeUnit.MINUTES.sleep(5);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

## 设计
接下来，我们在具体看一下AsyncLoopThread的实现。

核心代码就是这个init方法
```java
    private void init(RunnableCallback afn, boolean daemon, RunnableCallback kill_fn, int priority, boolean start) {
        if (kill_fn == null) {
            kill_fn = new AsyncLoopDefaultKill();
        }

        Runnable runnable = new AsyncLoopRunnable(afn, kill_fn);
        thread = new Thread(runnable);
        String threadName = afn.getThreadName();
        if (threadName == null) {
            threadName = afn.getClass().getSimpleName();
        }
        thread.setName(threadName);
        thread.setDaemon(daemon);
        thread.setPriority(priority);
        thread.setUncaughtExceptionHandler(new UncaughtExceptionHandler() {
            @Override
            public void uncaughtException(Thread t, Throwable e) {
                LOG.error("UncaughtException", e);
                JStormUtils.halt_process(1, "UncaughtException");
            }
        });

        this.afn = afn;

        if (start) {
            thread.start();
        }
    }
```
这里主要就是新建了一个AsyncLoopRunnable类，更核心的代码在这里。此外，要注意的一个是kill_fn，在AsyncLoopRunnable里会用到，负责杀掉任务，另外就是会对线程做几个配置，优先级，异常处理之类的，此外这里的线程都被设置成了守护线程，所以上边的例子里，我们需要主动让main线程sleep才能看到运行效果。

接下来再看一下AsyncLoopRunnable.
```java
    public void run() {
        if (fn == null) {
            LOG.error("fn==null");
            throw new RuntimeException("AsyncLoopRunnable no core function ");
        }

        fn.preRun();

        try {
            while (!shutdown.get()) {
                fn.run();

                if (shutdown.get()) {
                    shutdown();
                    return;
                }

                Exception e = fn.error();
                if (e != null) {
                    throw e;
                }
                Object rtn = fn.getResult();
                if (this.needQuit(rtn)) {
                    shutdown();
                    return;
                }
            }
        } catch (Throwable e) {
            if (shutdown.get()) {
                shutdown();
            } else {
                LOG.error("Async loop died!!!" + e.getMessage(), e);
                killFn.execute(e);
            }
        }
    }
```
这个代码也很简单，就是循环的去执行RunnableCallback的run方法，期间会有shutdown,needQuit(),异常几种情况导致任务中断，或者直接杀掉进程。其中,needQuit()方法里会根据前边说的getResult控制任务执行速度。

原文地址：https://lichuanyang.top/posts/31761
---
