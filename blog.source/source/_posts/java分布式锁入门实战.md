---
title: java分布式锁入门实战
description: "Java 分布式锁的实战入门，介绍基于 Zookeeper 和 Redis 的分布式锁实现方式，只讲使用不讲原理。"
tags:
  - java
  - redis
  - zookeeper
  - 分布式
abbrlink: 48104
date: 2017-02-20 19:21:00
---


这篇文章只讲使用，不讲原理，简单粗暴。

分布式锁，顾名思义，就是分布式的锁，应用于一些分布式系统中。例如，有一个服务部在数太机器上，然后有可能操作数据库中的同一条记录。这时，就需要分布式锁。

分布式锁实现的方式很多，一般来说需要一个实体来代表一个锁，占用锁时就新建这个实体，锁释放时也对应将相应实体删除。同时，一般还需要一个锁超时过期的策略，避免一些异常情况造成锁无法被释放。

zookeeper和redis都是常用的实现分布式锁的方式。接下来就简单介绍一下这两种方式的使用。

## 基于zookeeper的分布式锁

使用zookeeper的话，建议直接使用curator客户端.

            <span class="hljs-tag">&lt;<span class="hljs-title">dependency</span>&gt;</span>
                <span class="hljs-tag">&lt;<span class="hljs-title">groupId</span>&gt;</span>org.apache.curator<span class="hljs-tag">&lt;/<span class="hljs-title">groupId</span>&gt;</span>
                <span class="hljs-tag">&lt;<span class="hljs-title">artifactId</span>&gt;</span>curator-recipes<span class="hljs-tag">&lt;/<span class="hljs-title">artifactId</span>&gt;</span>
                <span class="hljs-tag">&lt;<span class="hljs-title">version</span>&gt;</span>2.9.1<span class="hljs-tag">&lt;/<span class="hljs-title">version</span>&gt;</span>
            <span class="hljs-tag">&lt;/<span class="hljs-title">dependency</span>&gt;</span>`</pre>

    curator中实现了一个InterProcessSemaphoreMutex类，用作分布式锁。

    实现原理其实也很直白：建立锁的时候约定一个路径新建一个节点，作为锁的实体；锁释放时就将这个节点删除。

    代码例子片段:

    <pre class="prettyprint">`InterProcessSemaphoreMutex lock;
    lock.acquire(&hellip;);  <span class="hljs-comment">//acquire获取锁</span>
    &hellip;.
    lock.release();释放锁

详细的使用例子代码可以参考 [https://github.com/lcy362/Scenes/blob/master/src/main/java/com/mallow/concurrent/zklock/InterProcessMutexExample.java](https://github.com/lcy362/Scenes/blob/master/src/main/java/com/mallow/concurrent/zklock/InterProcessMutexExample.java)

## 基于redis的分布式锁

同样推荐一个第三方的redis客户端redisson, [https://github.com/redisson/redisson](https://github.com/redisson/redisson). redisson的知名度不如curator高，但也是一个非常优秀的开源工具，支持各种集群、数据结构。

redis锁的原理就是占用锁时新建一个key, 锁释放时key删除。

代码示例可以参考[https://github.com/lcy362/Scenes/blob/master/src/main/java/com/mallow/concurrent/redislock/ValuelockExample.java](https://github.com/lcy362/Scenes/blob/master/src/main/java/com/mallow/concurrent/redislock/ValuelockExample.java)

