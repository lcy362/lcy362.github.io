---
title: hadoop基本的学习资料
description: "Hadoop 学习资料整理，包含 WordCount 运行过程详解、HDFS 命令介绍等入门资源汇总。"
keywords:
  - Hadoop
  - HDFS
  - MapReduce
  - 大数据
  - 学习资料
categories:
  - 大数据
tags:
  - hadoop
  - 大数据
abbrlink: 35575
cover: /img/hadoop.jpg
date: 2012-10-28 18:05:00
---
> ⚠️ 这是一篇 **2012 年**的学习笔记。Hadoop 生态在过去十几年发生了巨大变化，下面的链接已非常陈旧。我保留了原始内容作为历史记录，并补充了 2026 年的学习建议。

<!-- more -->

## 为什么 2026 年还要了解 Hadoop？

可能你会问：现在都用 Spark、Flink、数据湖了，为什么还要学 Hadoop？

答案很简单：**HDFS 和 YARN 仍然是大数据基础设施的底座**。Spark 默认跑在 YARN 上，Hive 的表数据存在 HDFS 里，甚至很多云原生数据平台底层还是 HDFS 兼容存储。理解 Hadoop 的核心设计（分布式文件系统、计算资源调度、数据本地性），能帮你更好地理解上层框架的设计决策。

## 2026 年推荐的学习路径

### 入门：理解核心概念

1. **HDFS**：分布式文件系统的基本原理——NameNode/DataNode 架构、数据块（block）、副本机制、机架感知
2. **MapReduce**：了解 map-shuffle-reduce 的计算模型，理解为什么它适合批处理但不适合迭代计算
3. **YARN**：资源管理和调度框架，理解 ApplicationMaster 和 Container 的概念

推荐阅读：[Hadoop 官方文档](https://hadoop.apache.org/docs/stable/)（最新的 3.x 版本）

### 进阶：从理论到实践

与其从零写 MapReduce 程序，我更推荐直接上手 Spark：

- **Spark**：比 MapReduce 更快、API 更友好，支持 SQL/DataFrame/Streaming/MLlib 多种范式
- **Hive**：SQL on Hadoop，将 SQL 转化为分布式计算任务，适合数据分析场景

### 深入：理解架构演进

Hadoop 1.x → 2.x → 3.x 的几个关键变化值得了解：

| 版本 | 重要变化 |
|------|---------|
| 1.x | 基础 HDFS + MapReduce，单 NameNode（单点故障） |
| 2.x | 引入 YARN（资源管理分离）、NameNode HA、Federation |
| 3.x | Erasure Coding（节省存储）、YARN Timeline Service v2、GPU 调度支持 |

---

## 📚 原始笔记（2012 年整理）

以下链接是当年初学 Hadoop 时整理的资料，其中大部分链接可能已失效或内容过时，仅作历史参考：

- [WordCount 运行过程详解](http://www.cnblogs.com/xia520pi/archive/2012/05/16/2504205.html) — 理解 MapReduce 入门的经典案例
- [HDFS 命令介绍](http://www.cnblogs.com/gpcuster/archive/2010/06/04/1751538.html) — 基础文件操作命令
- [HDFS 命令（另一篇）](http://hi.baidu.com/gkf8605/item/d6b8af09c3463512eafe38b1) — 补充命令参考
- [MapReduce 入门](http://www.cnblogs.com/forfuture1978/archive/2010/11/14/1877086.html) — MapReduce 编程模型入门
- [Hadoop 0.20.2 API](http://hadoop.apache.org/docs/r0.20.2/api/index.html) — 0.20.2 版本 API 文档

> 回想 2012 年刚开始接触 Hadoop 的时候，还没有 Spark、没有数据湖、没有 Kubernetes。那时候 MapReduce 就是大数据处理的全部，连 Hive 都还在早期版本。技术的发展速度总是超出预期，但基础原理永远是值得学习的。
---
