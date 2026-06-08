---
title: "Five Minutes to Learn Storm Coding: JStorm/Storm Coding Principles and Differences from Regular Java Programs"
description: "A quick start guide to Storm/JStorm programming, highlighting the key differences in initialization between topology runtime and traditional Java programs."
keywords:
  - Storm
  - JStorm
  - topology
  - spout
  - bolt
  - getting started
categories:
  - Big Data
tags:
  - storm
abbrlink: 27021
cover: /img/27021.png
date: 2016-11-16 18:21:00
---
### Runtime Mechanism

The overall structure of spout/bolt in a topology won't be discussed in detail here. The focus is on the potential differences between Storm/JStorm topology runtime and traditional Java programs. In fact, there are very few differences, mainly体现在 initialization. The purpose of this article is to help developers troubleshoot potential topology program issues without needing to understand Storm's internal principles.

A topology contains multiple spout threads and bolt threads, distributed across several workers (processes). A single worker may run multiple threads of several bolts/spouts simultaneously.

### Differences from Regular Java Programs

#### main Method

The main method only runs on the nimbus during startup. Therefore, besides Storm's own configuration items, other program-related configurations such as Spring configurations configured in the main method **will not take effect**.

#### bolt

The main structure of a bolt consists of three parts: `prepare`, `execute`, and `cleanup`.

Among them, `prepare` executes once during initialization, `cleanup` executes once before exit, and `execute` runs for each message.

Some configurations, **including encryption and Spring loading, are recommended to be placed in the `prepare` method**. When multiple bolts need to load Spring, it is recommended to use the same configuration to avoid some tricky issues.

#### Serialization

All variables initialized in **static code blocks** and variables that are emitted need to be serializable due to network transmission.

Storm defaults to using Kryo serialization, which requires classes to have a no-argument constructor. If adding a no-argument constructor is not possible, set `topology.fall.back.on.java.serialization: true` to use Java's built-in serialization.

---
