---
title: Java Distributed Lock Practice for Beginners
description: "Getting started with Java distributed locks in practice, covering distributed lock implementations based on Zookeeper and Redis — usage only, no theory."
keywords:
  - Java
  - Distributed Lock
  - Zookeeper
  - Redis
  - Practice
categories:
  - Java
tags:
  - java
  - redis
  - zookeeper
  - distributed
abbrlink: 48104
tldr: "Focuses on usage rather than theory, introducing distributed lock implementations based on Zookeeper (Curator) and Redis with code examples."
cover: /img/java-distributed-lock.jpg
date: 2017-02-20 19:21:00
---
This article covers usage only, no theory. Simple and straightforward.

A distributed lock is, as the name suggests, a lock for distributed systems, used in scenarios where multiple instances need coordination. For example, if a service is deployed on multiple machines and may operate on the same record in a database, a distributed lock becomes necessary.

There are many ways to implement distributed locks. Generally, a lock requires an entity to represent it — when acquiring the lock, this entity is created; when releasing the lock, the corresponding entity is deleted. Additionally, a lock expiration strategy is typically needed to handle situations where a lock cannot be released due to abnormal conditions.

Both Zookeeper and Redis are commonly used to implement distributed locks. Below is a brief introduction to using each approach.

## Zookeeper-based Distributed Lock

If using Zookeeper, it is recommended to use the Curator client directly.

```xml
<dependency>
    <groupId>org.apache.curator</groupId>
    <artifactId>curator-recipes</artifactId>
    <version>2.9.1</version>
</dependency>
```

Curator provides an `InterProcessSemaphoreMutex` class that serves as a distributed lock.

The implementation principle is straightforward: when creating a lock, a node is created at an agreed-upon path to serve as the lock entity; when releasing the lock, this node is deleted.

Code example snippet:

```java
InterProcessSemaphoreMutex lock;
lock.acquire(...);  // acquire the lock
...
lock.release();     // release the lock
```

For a detailed usage example, refer to [https://github.com/lcy362/Scenes/blob/master/src/main/java/com/mallow/concurrent/zklock/InterProcessMutexExample.java](https://github.com/lcy362/Scenes/blob/master/src/main/java/com/mallow/concurrent/zklock/InterProcessMutexExample.java)

## Redis-based Distributed Lock

Similarly, a third-party Redis client Redisson is recommended: [https://github.com/redisson/redisson](https://github.com/redisson/redisson). Redisson is not as well-known as Curator, but it is also an excellent open-source tool that supports various cluster configurations and data structures.

The principle of a Redis lock is simple: when acquiring the lock, a new key is created; when releasing the lock, the key is deleted.

For code examples, refer to [https://github.com/lcy362/Scenes/blob/master/src/main/java/com/mallow/concurrent/redislock/ValuelockExample.java](https://github.com/lcy362/Scenes/blob/master/src/main/java/com/mallow/concurrent/redislock/ValuelockExample.java)

Source: https://lichuanyang.top/en/posts/48104/
