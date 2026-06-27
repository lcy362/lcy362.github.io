---
title: camel系列之camel debugger的使用
description: "Apache Camel 调试工具 debugger 的使用指南，帮助在 Camel 高度封装的数据路由框架中高效排查问题。"
keywords:
  - Apache
  - Camel
  - debugger
  - 调试
  - 数据路由
faq:
  - Q: 什么时候用 Debugger 而不是 Tracer？
  - Q: Camel 调试有哪些替代工具？
  - Q: Debugger 会影响性能吗？
  - Q: Debugger 只能用在测试环境吗？
categories:
  - 消息队列
tags:
  - camel
abbrlink: 1120
cover: /img/1120.jpg
tldr: 用Camel Debugger可以像调试普通Java程序一样在路由节点打断点
date: 2017-08-03 19:56:00
howto:
  - 引入依赖：在pom.xml中添加camel-test依赖
  - 创建Debugger类：继承CamelTestSupport，重写debugBefore和debugAfter方法
  - 配置调试路由：在createRouteBuilder中定义待调试的路由
  - 运行测试：启动debugger，观察每个节点处理前后的消息内容和耗时
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

## 常见问题

### Q: 什么时候用 Debugger 而不是 Tracer？

Debugger 适合**本地开发调试**，信息最全面，可以逐节点打断点、查看消息体、对比处理前后的变化。Tracer 适合**线上生产环境排查**，全局开启后可追踪每一条消息经过的完整路由路径，但会对性能有一定影响。简单选择就是：开发环境用 Debugger 精确定位问题，生产环境用 Tracer 快速了解消息流向。

### Q: Camel 调试有哪些替代工具？

除了 Debugger，Camel 还提供了 Tracer Interceptor（全局消息追踪）、Log EIP（在路由中插入临时日志）、以及 Hawtio 管理控制台（可视化监控）。此外，也可以在路由中临时添加 `log:` 或 `wireTap:` 组件来做即时排查。

### Q: Debugger 会影响性能吗？

会有影响。Debugger 在每个 processor 执行前后都会触发回调，如果回调中做了大量日志输出或序列化操作，路由吞吐量会明显下降。因此 Debugger 设计上只用于本地开发和测试，不建议在生产环境开启。

### Q: Debugger 只能用在测试环境吗？

严格来说是的。Camel 的 Debugger 依托于 `CamelTestSupport` 基类，本身就设计为测试工具。如果需要在运行中的路由上做调试，应使用 Tracer、Hawtio 控制台或 JMX 监控等替代方案。

## 快速上手步骤

1. **引入依赖**：在 `pom.xml` 中添加 `camel-test` 依赖，版本与项目中的 Camel 版本保持一致。
2. **创建 Debugger 类**：继承 `CamelTestSupport`，重写 `createRouteBuilder()` 定义待调试路由，重写 `debugBefore()` 和 `debugAfter()` 打印消息内容和处理耗时。
3. **配置调试路由**：在 `createRouteBuilder` 中通过 `from().to()` 或 `from().bean().to()` 等方式定义完整的路由链路。
4. **运行测试**：直接运行 Debugger 类，观察控制台输出，通过 `debugBefore` 确认消息进入状态，通过 `debugAfter` 对比处理变化和定位慢节点。
