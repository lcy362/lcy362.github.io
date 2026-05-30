---
title: JStorm Source Code Analysis: The Loop Task AsyncLoopThread
description: "Source code analysis of JStorm's custom loop task utility AsyncLoopThread, understanding the underlying implementation of supervisor/nimbus heartbeat and other functions."
keywords:
  - JStorm
  - AsyncLoopThread
  - source code analysis
  - loop task
tags:
  - jstorm
categories:
  - JStorm Source Code Analysis
abbrlink: 31761
date: 2018-02-08 16:17:37
---
## Overview
AsyncLoopThread is a custom loop task execution utility in JStorm. The implementation is not complex, and on its own may not warrant a dedicated article. However, it is so widely used in JStorm — for features such as supervisor/nimbus heartbeat, fetching new topologies, updating worker status, and many more — that it's worth introducing here, as it will also help with reading other parts of the codebase.
<!-- more -->

## Usage
AsyncLoopThread can actually be extracted and used in your own projects. It's quite convenient to use. You can refer to https://github.com/lcy362/Scenes/blob/4d8ec4ff166060cf5d491c33a96f5c86e8389333/src/main/java/com/mallow/jstormcode/AsyncLoop.java

You only need to first define a RunnableCallback class. RunnableCallback is a thread class wrapped by JStorm that enhances the Runnable interface with callback support and the ability to proactively shut down.

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

Here we only implement two methods: run and getResult. The run method is the thread execution method, same as a normal thread. getResult returns the task execution interval time, in seconds.

After that, you just need to pass this TestThread as a parameter to AsyncLoopThread, and it will implement the loop execution of TestThread's run method.

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

## Design
Next, let's look at the specific implementation of AsyncLoopThread.

The core code is the init method:
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
The main thing here is the creation of a new AsyncLoopRunnable class, where the more core code resides. Additionally, note the kill_fn parameter, which is used in AsyncLoopRunnable to kill the task. The thread is also configured with several settings: priority, exception handling, etc. Furthermore, all threads here are set as daemon threads, which is why in the example above, we need to explicitly make the main thread sleep to observe the running effect.

Next, let's look at AsyncLoopRunnable:
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
This code is also quite simple — it loops through the execution of RunnableCallback's run method. During execution, there are several scenarios that cause the task to be interrupted or the process to be killed directly: shutdown, needQuit(), and exceptions. Among these, the needQuit() method controls the task execution speed based on the getResult return value mentioned earlier.

Original article: https://lichuanyang.top/posts/31761

---

Source: https://lichuanyang.top/en/posts/31761/
