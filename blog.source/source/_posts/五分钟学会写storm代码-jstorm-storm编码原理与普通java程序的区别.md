---
title: '五分钟学会写storm代码: jstorm/storm编码原理与普通java程序的区别'
description: "Storm/JStorm 编程快速入门，重点说明 topology 运行时与传统 Java 程序在初始化上的关键区别。"
keywords:
  - Storm
  - JStorm
  - topology
  - spout
  - bolt
  - 入门
categories:
  - 大数据
tags:
  - storm
abbrlink: 27021
tldr: "Storm 与传统 Java 程序有三大关键区别：main 方法仅在提交节点运行、初始化须在生命周期方法中完成、数据传输必须可序列化。"
cover: /img/27021.jpg
date: 2016-11-16 18:21:00
---
Storm（以及阿里巴巴开源的 JStorm）是一个分布式实时计算框架。它的编程模型跟传统 Java 程序有一些关键区别，如果不了解这些区别，很容易写出在本地跑得好好的、部署到集群就出各种诡异 bug 的代码。

本文不深入 Storm 内核原理，而是聚焦开发者最需要知道的几个关键区别，帮你快速上手并避开常见坑。

<!-- more -->

## Storm 运行机制速览

一个 Storm Topology 由若干 Spout（数据源）和 Bolt（处理逻辑）组成，它们分散运行在多个 Worker（进程）中。同一个 Worker 可能同时运行多个 Spout/Bolt 的多个线程。

关键要理解的是：**你的代码会被序列化后分发到各个 Worker 上执行，而不是在提交 Topology 的那台机器上运行。**

## 与传统 Java 程序的三大关键区别

### 1. main 方法只跑在 Nimbus 上

`main` 方法只在提交 Topology 时运行在 Nimbus（Storm 的 master 节点）上。它的作用仅限于构建 Topology 的结构并提交——**实际的 Spout 和 Bolt 代码不在 main 方法所在进程执行**。

这意味着：

```java
// ❌ 这样不会生效！
public static void main(String[] args) {
    // Spring 容器在这里初始化，但 Worker 进程完全看不见
    ApplicationContext ctx = new ClassPathXmlApplicationContext("applicationContext.xml");
    
    TopologyBuilder builder = new TopologyBuilder();
    builder.setSpout("myspout", new MySpout());
    builder.setBolt("mybolt", new MyBolt()).shuffleGrouping("myspout");
    
    StormSubmitter.submitTopology("mytopo", config, builder.createTopology());
}
```

Spring 配置、数据库连接池、加密密钥等，都不能放在 `main` 中初始化。`main` 里只放 Storm 本身的配置项（`Config` 对象）和 Topology 结构构建。

### 2. Spout/Bolt 的生命周期

每个 Spout 和 Bolt 都有自己的生命周期方法：

| 组件 | 初始化 | 每条消息 | 退出 |
|------|--------|---------|------|
| **Spout** | `open()` | `nextTuple()` | `close()` |
| **Bolt** | `prepare()` | `execute()` | `cleanup()` |

关键点：

- **`prepare()`/`open()` 在 Worker 进程启动时执行一次**——这里才是做初始化的正确位置。Spring 容器、数据库连接、配置加载等，都放在这里。
- **多个 Bolt 需要加载 Spring 时，建议使用相同配置**：多个 Bolt 在同一个 Worker 中可能共享 JVM 进程，重复初始化 Spring 容器可能造成资源浪费甚至冲突。

```java
public class MyBolt extends BaseRichBolt {
    private SomeService service;
    
    @Override
    public void prepare(Map stormConf, TopologyContext context, OutputCollector collector) {
        // ✅ 初始化放在这里
        ApplicationContext ctx = new ClassPathXmlApplicationContext("applicationContext.xml");
        this.service = ctx.getBean(SomeService.class);
    }
    
    @Override
    public void execute(Tuple input) {
        // 每条消息处理
        service.process(input);
    }
}
```

### 3. 序列化——最常见的坑

由于 Spout 和 Bolt 可能在不同 Worker（甚至不同机器）上运行，**所有通过 Storm 传输的数据都必须可序列化**：

- `emit()` 发出的 Tuple
- Spout/Bolt 的成员变量（如果不是在 `prepare()` 中初始化而是在构造器或静态块中）
- 配置中传递的对象

Storm 默认使用 **Kryo** 序列化，它比 Java 原生序列化更快，但有一些要求：

- **类必须有公开的无参构造函数**。如果类没有无参构造（比如某些第三方库的类），会有 `IllegalArgumentException`
- **内部类和匿名类默认不支持**，需要手动注册

如果不方便添加无参构造函数，可以降级：

```java
Config config = new Config();
config.setFallBackOnJavaSerialization(true);  // 降级为 Java 序列化
```

## 一个完整的 WordCount 示例

```java
// Spout：不断发射句子
public class SentenceSpout extends BaseRichSpout {
    private SpoutOutputCollector collector;
    private String[] sentences = {
        "hello world", "hello storm", "goodbye world"
    };
    private int index = 0;

    @Override
    public void open(Map conf, TopologyContext context, SpoutOutputCollector collector) {
        this.collector = collector;
    }

    @Override
    public void nextTuple() {
        collector.emit(new Values(sentences[index]));
        index = (index + 1) % sentences.length;
        Utils.sleep(1000);
    }

    @Override
    public void declareOutputFields(OutputFieldsDeclarer declarer) {
        declarer.declare(new Fields("sentence"));
    }
}

// Bolt 1：拆分单词
public class SplitBolt extends BaseRichBolt {
    private OutputCollector collector;

    @Override
    public void prepare(Map conf, TopologyContext context, OutputCollector collector) {
        this.collector = collector;
    }

    @Override
    public void execute(Tuple tuple) {
        String sentence = tuple.getStringByField("sentence");
        for (String word : sentence.split(" ")) {
            collector.emit(new Values(word));
        }
    }

    @Override
    public void declareOutputFields(OutputFieldsDeclarer declarer) {
        declarer.declare(new Fields("word"));
    }
}

// Bolt 2：计数
public class CountBolt extends BaseRichBolt {
    private OutputCollector collector;
    private Map<String, Integer> counts = new HashMap<>();

    @Override
    public void prepare(Map conf, TopologyContext context, OutputCollector collector) {
        this.collector = collector;
    }

    @Override
    public void execute(Tuple tuple) {
        String word = tuple.getStringByField("word");
        counts.merge(word, 1, Integer::sum);
        System.out.println(word + ": " + counts.get(word));
    }

    @Override
    public void declareOutputFields(OutputFieldsDeclarer declarer) {}
}
```

## 2026 年的视角

Storm 曾经是实时计算的事实标准，但近年来 **Apache Flink** 已经成为流计算的主流选择。Flink 提供了更好的 exactly-once 语义、更丰富的窗口操作和更成熟的状态管理。如果你是新项目选型，我会建议优先考虑 Flink。

不过，如果你维护的是已有的 Storm/JStorm 遗留系统，本文的内容依然能帮你快速定位问题。理解了 Storm 的 Worker 模型和序列化机制，很多"诡异的线上 bug"其实都有迹可循。

---
