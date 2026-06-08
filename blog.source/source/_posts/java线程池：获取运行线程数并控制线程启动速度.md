---
title: java线程池：获取运行线程数并控制线程启动速度
description: "解决线程池中任务提交速度远快于执行速度导致内存爆满的问题，介绍在提交前检查运行线程数的方法。"
keywords:
  - Java
  - 线程池
  - 内存优化
  - 任务提交
  - 并发
categories:
  - Java
tags:
  - java
  - 多线程
abbrlink: 5707
cover: /img/5707.png
date: 2017-05-26 20:36:00
---
在java里， 我们可以使用Executors.newFixedThreadPool 来创建线程池， 然后就可以不停的创建新任务，并用线程池来执行了。

在提交任务时，如果线程池已经被占满，任务会进到一个队列里等待执行。

这种机制在一些特定情况下会有些问题。今天我就遇到一种情况：创建线程比线程执行的速度要快的多，而且单个线程占用的内存又多，所以很快内存就爆了。

想了一个办法，就是在提交任务之前，先检查目前正在执行的线程数目，只有没把线程池占满的时候在去提交任务。

代码很简单：
```java
          int threadCount = ((ThreadPoolExecutor)executor).getActiveCount();
//        System.out.println("running : " + threadCount);
          while (threadCount == POOL_SIZE) {
             TimeUnit.MILLISECONDS.sleep(1);
             threadCount = ((ThreadPoolExecutor)executor).getActiveCount();
//           System.out.println("running : " + threadCount);
          }

         executor.execute
```
---
