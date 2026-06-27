---
title: camel系列之camel debugger的使用
description: "Apache Camel 调试工具 debugger 的使用指南，帮助在 Camel 高度封装的数据路由框架中高效排查问题。"
keywords:
  - Apache
  - Camel
  - debugger
  - 调试
  - 数据路由
categories:
  - 消息队列
tags:
  - camel
abbrlink: 1120
cover: /img/1120.jpg
date: 2017-08-03 19:56:00
---
Apache Camel 是一个强大的企业集成框架，基于 EIP（Enterprise Integration Patterns）实现了 200 多种组件，可以轻松连接各种数据源和中间件。但它的强大也带来一个问题：高度封装让底层细节变得不透明，一旦路由出问题，排查起来非常困难。

好在 Camel 官方提供了一个 Debugger 工具，可以像调试普通 Java 程序一样在路由节点上打断点、查看消息内容。本文在[官方文档](http://camel.apache.org/debugger.html)的基础上，补充一些实用的调试技巧。

<!-- more -->

## 为什么要用 Debugger？

Camel 的路由定义通常非常声明式，比如：

```java
from("file:inbox")
    .unmarshal().json()
    .bean(SomeTransformer.class)
    .to("activemq:queue:orders");
```

看起来清晰简洁，但如果消息在某个环节被处理错了，你怎么知道是 `unmarshal` 出了问题还是 `SomeTransformer` 的 bug？这个时候 Debugger 就派上用场了。

## 快速上手

### 1. 引入依赖

首先引入 `camel-test` 包：

```xml
<dependency>
    <groupId>org.apache.camel</groupId>
    <artifactId>camel-test</artifactId>
    <version>2.16.2</version>
</dependency>
```

### 2. 创建 Debugger 类

继承 `CamelTestSupport`，这是 Camel 提供的一个方便的测试基类：

```java
public class CamelDebugger extends CamelTestSupport {
    
    @Override
    protected RoutesBuilder createRouteBuilder() {
        return new RouteBuilder() {
            @Override
            public void configure() {
                from("direct:start")
                    .log("Received: ${body}")
                    .bean(SomeTransformer.class)
                    .to("mock:result");
            }
        };
    }

    @Override
    protected void debugBefore(Exchange exchange, Processor processor, 
                                 ProcessorDefinition<?> definition, String id, String label) {
        log.info("Before {}: body={}, headers={}", 
            id, exchange.getIn().getBody(), exchange.getIn().getHeaders());
    }

    @Override
    protected void debugAfter(Exchange exchange, Processor processor, 
                                ProcessorDefinition<?> definition, String id, String label, long timeTaken) {
        log.info("After {}: body={}, took {}ms", 
            id, exchange.getIn().getBody(), timeTaken);
    }
}
```

## 关键方法详解

`CamelTestSupport` 中与调试相关的几个关键方法：

### `createCamelContext()`

自定义 CamelContext，可以配置组件、注册 bean 等。适用于需要精确控制测试环境的场景。

### `createRouteBuilder()`

使用默认 CamelContext，只添加自己的路由。这是最简单的方式，适合大多数调试场景。

### `debugBefore()` 和 `debugAfter()`

这两个方法是 Debugger 的核心：

- **`debugBefore`**：在消息被每个 processor 处理**之前**调用。参数包括当前的 Exchange（含消息体、消息头、属性）、即将执行的 Processor、路由节点 ID 和 label。适合用来**确认"进入这个节点时消息是什么状态"**。

- **`debugAfter`**：在消息被处理**之后**调用。多了 `timeTaken` 参数，表示这个 processor 的执行耗时。适合用来**对比处理前后的变化**，以及**定位性能瓶颈**。

## 实战示例：排查消息丢失

假设你的路由中有一条消息在某个节点之后消失了，你可以这样 debug：

```java
@Override
protected void debugAfter(Exchange exchange, Processor processor,
                            ProcessorDefinition<?> definition, String id, String label, long timeTaken) {
    Object body = exchange.getIn().getBody();
    if (body == null) {
        log.error("⚠️ Message body is null after processor: {} (id={})", label, id);
    }
    // 记录每个节点的耗时，超过 1 秒的告警
    if (timeTaken > 1000) {
        log.warn("🐢 Slow processor: {} took {}ms", label, timeTaken);
    }
}
```

## 替代方案

Debugger 不是唯一的选择，Camel 还提供了其他排查手段：

| 方式 | 适用场景 | 优劣 |
|------|---------|------|
| **Debugger** | 本地开发调试 | 信息最全面，但需要启动测试 |
| **Tracer Interceptor** | 生产环境排查 | 可以全局开启，但对性能有影响 |
| **Log EIP（`log:` 组件）** | 路由中插入临时日志 | 最简单，但需要改路由代码 |
| **Hawtio 管理控制台** | 可视化监控 | 可以看到运行状态，但调试粒度较粗 |

## 完整代码

完整的可运行示例在这里：  
[https://github.com/lcy362/CamelDemo](https://github.com/lcy362/CamelDemo/blob/7aef2cc7661236499896022f6976c160b73b68e7/src/main/java/com/mallow/demo/camel/debugger/CamelDebugger.java)

> 这是 Camel 系列文章之一。如果你在使用 Camel 做数据路由或系统集成，欢迎关注后续文章，或者[到 GitHub 上交流](https://github.com/lcy362/CamelDemo)。
---
