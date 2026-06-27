---
title: "Camel Series: Using Camel Debugger"
description: "Apache Camel debugger tool usage guide, helping to efficiently troubleshoot issues in Camel's highly encapsulated data routing framework."
keywords:
  - Apache
  - Camel
  - debugger
  - debugging
  - data routing
categories:
  - Message Queue
tags:
  - camel
abbrlink: 1120
cover: /img/1120.jpg
date: 2017-08-03 19:56:00
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
