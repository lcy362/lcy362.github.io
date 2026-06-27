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
cover: /img/27021.jpg
date: 2016-11-16 18:21:00
---
Storm (and Alibaba's open-source fork JStorm) is a distributed real-time computation framework. Its programming model has some key differences from traditional Java programs. If you don't understand these differences, it's easy to write code that runs fine locally but produces all sorts of bizarre bugs when deployed to a cluster.

This article doesn't dive deep into Storm's internals. Instead, it focuses on the few critical differences that developers most need to know — helping you get up to speed quickly and avoid common pitfalls.

<!-- more -->

## A Quick Look at Storm's Runtime

A Storm Topology consists of several Spouts (data sources) and Bolts (processing logic), distributed across multiple Workers (processes). A single Worker may simultaneously run multiple threads belonging to multiple Spouts/Bolts.

The key thing to understand is: **your code gets serialized, distributed to each Worker, and executed there — not on the machine that submits the Topology.**

## Three Key Differences from Regular Java Programs

### 1. The main Method Only Runs on Nimbus

The `main` method only executes on the Nimbus (Storm's master node) when submitting the Topology. Its sole purpose is to build the Topology structure and submit it — **the actual Spout and Bolt code does not run in the same process as main**.

What this means:

```java
// ❌ This won't work as you expect!
public static void main(String[] args) {
    // Spring context initialized here, but Worker processes can't see it
    ApplicationContext ctx = new ClassPathXmlApplicationContext("applicationContext.xml");
    
    TopologyBuilder builder = new TopologyBuilder();
    builder.setSpout("myspout", new MySpout());
    builder.setBolt("mybolt", new MyBolt()).shuffleGrouping("myspout");
    
    StormSubmitter.submitTopology("mytopo", config, builder.createTopology());
}
```

Spring configurations, database connection pools, encryption keys, etc., must not be initialized in `main`. Only Storm's own configuration items (`Config` object) and Topology structure building belong there.

### 2. Spout/Bolt Lifecycle

Each Spout and Bolt has its own lifecycle methods:

| Component | Initialization | Per-Message | Shutdown |
|-----------|---------------|-------------|----------|
| **Spout** | `open()` | `nextTuple()` | `close()` |
| **Bolt** | `prepare()` | `execute()` | `cleanup()` |

Key points:

- **`prepare()`/`open()` runs once when the Worker process starts** — this is the correct place for initialization. Spring containers, database connections, configuration loading — put them all here.
- **When multiple Bolts need to load Spring, use the same configuration**: Multiple Bolts in the same Worker may share a JVM process. Repeatedly initializing Spring containers can waste resources or even cause conflicts.

```java
public class MyBolt extends BaseRichBolt {
    private SomeService service;
    
    @Override
    public void prepare(Map stormConf, TopologyContext context, OutputCollector collector) {
        // ✅ Initialization goes here
        ApplicationContext ctx = new ClassPathXmlApplicationContext("applicationContext.xml");
        this.service = ctx.getBean(SomeService.class);
    }
    
    @Override
    public void execute(Tuple input) {
        // Process each message
        service.process(input);
    }
}
```

### 3. Serialization — The Most Common Pitfall

Since Spouts and Bolts may run on different Workers (even different machines), **all data transmitted through Storm must be serializable**:

- Tuples emitted via `emit()`
- Spout/Bolt member variables (if initialized in constructors or static blocks rather than in `prepare()`)
- Objects passed through configuration

Storm defaults to **Kryo** serialization, which is faster than Java's native serialization, but has some requirements:

- **Classes must have a public no-arg constructor**. If a class lacks one (as with some third-party library classes), you'll encounter `IllegalArgumentException`
- **Inner classes and anonymous classes are not supported by default** and need manual registration

If adding a no-arg constructor isn't feasible, you can fall back:

```java
Config config = new Config();
config.setFallBackOnJavaSerialization(true);  // Fall back to Java serialization
```

## A Complete WordCount Example

```java
// Spout: continuously emits sentences
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

// Bolt 1: Split words
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

// Bolt 2: Count words
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

## A 2026 Perspective

Storm was once the de facto standard for real-time computation, but in recent years **Apache Flink** has become the mainstream choice for stream processing. Flink offers better exactly-once semantics, richer window operations, and more mature state management. If you're choosing a framework for a new project, I would recommend considering Flink first.

That said, if you're maintaining an existing Storm/JStorm legacy system, the content in this article can still help you quickly identify issues. Once you understand Storm's Worker model and serialization mechanism, many "mysterious production bugs" actually have traceable causes.

---
Source: https://lichuanyang.top/en/posts/27021/

---
