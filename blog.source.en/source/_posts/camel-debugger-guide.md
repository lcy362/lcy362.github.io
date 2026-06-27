---
title: "Camel Series: Using Camel Debugger"
description: "Apache Camel debugger tool usage guide, helping to efficiently troubleshoot issues in Camel's highly encapsulated data routing framework."
keywords:
  - Apache
  - Camel
  - debugger
  - debugging
  - data routing
faq:
  - Q: When should I use Debugger instead of Tracer?
  - Q: What alternative debugging tools does Camel offer?
  - Q: Does Debugger impact performance?
  - Q: Is Debugger only for test environments?
categories:
  - Message Queue
tags:
  - camel
abbrlink: 1120
cover: /img/1120.jpg
tldr: Debug Camel routes like regular Java programs with Camel Debugger breakpoints
date: 2017-08-03 19:56:00
howto:
  - Add dependency: Include camel-test in pom.xml
  - Create Debugger class: Extend CamelTestSupport, override debugBefore and debugAfter methods
  - Configure debug route: Define the route under test in createRouteBuilder
  - Run test: Start the debugger and observe message content and processing time at each node
---
Apache Camel is a powerful enterprise integration framework built on EIP (Enterprise Integration Patterns), with over 200 components that can easily connect various data sources and middleware. However, this power comes with a downside: the high level of encapsulation makes the underlying details opaque, and troubleshooting route problems can be very difficult.

Fortunately, the Camel team provides a Debugger tool that allows you to set breakpoints at route nodes and inspect message content, just like debugging a regular Java program. This article supplements the [official documentation](http://camel.apache.org/debugger.html) with some practical debugging tips.

<!-- more -->

## Why Use the Debugger?

Camel route definitions are typically very declarative, for example:

```java
from("file:inbox")
    .unmarshal().json()
    .bean(SomeTransformer.class)
    .to("activemq:queue:orders");
```

It looks clean and simple, but if a message gets processed incorrectly at some stage, how would you know whether the `unmarshal` step is at fault or if `SomeTransformer` has a bug? That's where the Debugger comes in.

## Quick Start

### 1. Add Dependencies

First, import the `camel-test` package:

```xml
<dependency>
    <groupId>org.apache.camel</groupId>
    <artifactId>camel-test</artifactId>
    <version>2.16.2</version>
</dependency>
```

### 2. Create a Debugger Class

Extend `CamelTestSupport`, a convenient test base class provided by Camel:

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

## Key Methods Explained

Here are the key debug-related methods in `CamelTestSupport`:

### `createCamelContext()`

Customize the CamelContext — you can configure components, register beans, etc. This is suitable for scenarios where you need precise control over the test environment.

### `createRouteBuilder()`

Use the default CamelContext and only add your own route. This is the simplest approach and works well for most debugging scenarios.

### `debugBefore()` and `debugAfter()`

These two methods are the core of the Debugger:

- **`debugBefore`**: Called **before** a message is processed by each processor. Parameters include the current Exchange (with message body, headers, and properties), the Processor about to be executed, the route node ID, and label. Use this to **confirm "what does the message look like when entering this node"**.

- **`debugAfter`**: Called **after** the message is processed. Includes an additional `timeTaken` parameter indicating how long this processor took to execute. Use this to **compare the before-and-after changes** and to **identify performance bottlenecks**.

## Practical Example: Troubleshooting Message Loss

Suppose a message disappears after a certain node in your route. Here's how you would debug it:

```java
@Override
protected void debugAfter(Exchange exchange, Processor processor,
                            ProcessorDefinition<?> definition, String id, String label, long timeTaken) {
    Object body = exchange.getIn().getBody();
    if (body == null) {
        log.error("⚠️ Message body is null after processor: {} (id={})", label, id);
    }
    // Log a warning for any processor taking more than 1 second
    if (timeTaken > 1000) {
        log.warn("🐢 Slow processor: {} took {}ms", label, timeTaken);
    }
}
```

## Alternative Solutions

The Debugger is not the only option — Camel also provides other troubleshooting approaches:

| Method | Use Case | Pros & Cons |
|--------|----------|-------------|
| **Debugger** | Local development debugging | Most comprehensive information, but requires starting a test |
| **Tracer Interceptor** | Production troubleshooting | Can be enabled globally, but impacts performance |
| **Log EIP (`log:` component)** | Inserting temporary logs in routes | Simplest, but requires modifying route code |
| **Hawtio Management Console** | Visual monitoring | Shows runtime status, but coarser debugging granularity |

## Complete Code

A complete runnable example is available here:  
[https://github.com/lcy362/CamelDemo](https://github.com/lcy362/CamelDemo/blob/7aef2cc7661236499896022f6976c160b73b68e7/src/main/java/com/mallow/demo/camel/debugger/CamelDebugger.java)

> This is part of the Camel series. If you're using Camel for data routing or system integration, stay tuned for follow-up articles, or [chat on GitHub](https://github.com/lcy362/CamelDemo).

## Frequently Asked Questions

### Q: When should I use Debugger instead of Tracer?

The Debugger is ideal for **local development debugging** — it provides the most comprehensive information, allowing you to set breakpoints node by node, inspect message bodies, and compare before-and-after changes. Tracer is better suited for **production troubleshooting** — when enabled globally, it can track the full route path of every message, though with some performance impact. A simple rule of thumb: use Debugger in dev for precise troubleshooting, and Tracer in prod for a quick overview of message flows.

### Q: What alternative debugging tools does Camel offer?

Beyond the Debugger, Camel provides the Tracer Interceptor (global message tracking), Log EIP (insert temporary logs into routes), and the Hawtio Management Console (visual monitoring). You can also temporarily add `log:` or `wireTap:` components into routes for on-the-spot troubleshooting.

### Q: Does Debugger impact performance?

It does. The Debugger triggers callbacks before and after every processor execution. If your callbacks include heavy logging or serialization operations, route throughput will drop noticeably. This is why the Debugger is designed exclusively for local development and testing — it should never be enabled in production.

### Q: Is Debugger only for test environments?

Strictly speaking, yes. Camel's Debugger is built on the `CamelTestSupport` base class and is designed as a testing tool. If you need to debug a running route, use alternatives like Tracer, the Hawtio console, or JMX monitoring.

## Quick Start Guide

1. **Add dependency**: Add the `camel-test` dependency to `pom.xml`, matching the Camel version used in your project.
2. **Create Debugger class**: Extend `CamelTestSupport`, override `createRouteBuilder()` to define the route under test, and override `debugBefore()` / `debugAfter()` to log message content and processing time.
3. **Configure debug route**: In `createRouteBuilder`, define the complete route chain using `from().to()` or `from().bean().to()`.
4. **Run test**: Run the Debugger class directly and observe the console output — use `debugBefore` to confirm message entry, and `debugAfter` to compare changes and identify slow nodes.
