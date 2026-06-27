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
cover: /img/5707.jpg
tldr: 线程池背压推荐CallerRunsPolicy+有界队列，避免无限堆积导致OOM
date: 2017-05-26 20:36:00
---
Java 的线程池用起来很方便——`Executors.newFixedThreadPool(n)` 一行代码搞定。但如果任务提交速度远快于执行速度，任务会在无界队列中无限堆积，最终导致 OOM。今天分享一个真实案例和几种解决方案。

<!-- more -->

## 问题场景

假设你有一个批量处理任务：遍历一个目录下的 100 万个文件，每个文件提交一个任务去处理。每个任务需要加载一些数据到内存。

```java
ExecutorService executor = Executors.newFixedThreadPool(10);

for (File file : files) {
    executor.submit(() -> {
        // 这个任务占用大量内存
        byte[] data = loadFileContent(file);
        process(data);
    });
}
```

问题在于：`Executors.newFixedThreadPool` 使用的是**无界队列**（`LinkedBlockingQueue`），任务提交速度远大于执行速度时，队列中会堆积几十万个未执行的任务，每个任务内部又持有大量数据——内存很快爆炸。

## 方案一：手动轮询（不推荐）

当时应急写了一个土办法：

```java
int threadCount = ((ThreadPoolExecutor) executor).getActiveCount();
while (threadCount == POOL_SIZE) {
    TimeUnit.MILLISECONDS.sleep(1);
    threadCount = ((ThreadPoolExecutor) executor).getActiveCount();
}
executor.execute(task);
```

在提交之前轮询 activeCount，等有空闲线程了再提交。**能跑，但问题很多**：

- **Busy-waiting**：浪费 CPU
- **没有超时**：万一某个线程永远不释放，提交线程就永远阻塞
- **`getActiveCount()` 是近似值**：Java 文档明确说这个方法返回的是近似值，不一定准确

## 方案二：有界队列 + 拒绝策略（推荐）

```java
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    10,                        // corePoolSize
    10,                        // maximumPoolSize
    60L, TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(100),  // 有界队列：最多 100 个等待任务
    new ThreadPoolExecutor.CallerRunsPolicy()  // 队列满时由提交线程自己执行
);

for (File file : files) {
    executor.submit(() -> process(file));
}
```

`CallerRunsPolicy` 的行为：当线程池和队列都满了，`submit()` 的调用者自己执行这个任务——相当于天然的背压（backpressure），提交速度自动和消费速度对齐。

其他拒绝策略：

| 策略 | 行为 | 适用场景 |
|------|------|---------|
| `AbortPolicy` | 抛异常 | 需要感知到压力 |
| `CallerRunsPolicy` | 提交者自己执行 | 自然背压，推荐 |
| `DiscardPolicy` | 静默丢弃 | 不重要的任务 |
| `DiscardOldestPolicy` | 丢弃最老的任务 | 优先新任务 |

## 方案三：Semaphore 限流（更精细控制）

```java
Semaphore semaphore = new Semaphore(10 + 100);  // 线程数 + 队列容量

for (File file : files) {
    semaphore.acquire();  // 超过限制时阻塞
    executor.submit(() -> {
        try {
            process(file);
        } finally {
            semaphore.release();  // 任务完成后释放信号量
        }
    });
}
```

`Semaphore` 比 `CallerRunsPolicy` 更灵活——你可以独立控制限流的大小，不受线程池队列长度约束。

## 方案四：Guava RateLimiter（平滑限流）

```java
RateLimiter limiter = RateLimiter.create(50.0);  // 每秒最多提交 50 个任务

for (File file : files) {
    limiter.acquire();  // 匀速等待
    executor.submit(() -> process(file));
}
```

`RateLimiter` 是 Guava 提供的令牌桶实现，可以平滑控制提交速率。适合需要精确控制 QPS 的场景。

## 总结：背压策略怎么选？

- **简单场景**：直接用 `CallerRunsPolicy` + 有界队列，零额外代码
- **需要精细控制**：`Semaphore` 限流
- **需要平滑速率**：Guava `RateLimiter`
- **永远不要**：无界队列 + busy-waiting 轮询 `getActiveCount()`
---
