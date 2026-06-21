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
Apache Camel is a powerful tool for data routing, very convenient to use. However, at the same time, there is a problem: because it's overly well-encapsulated, hiding many technical details, troubleshooting can be difficult when issues arise. Fortunately, the official team provides a debug tool that can help us set breakpoints and debug normally. http://camel.apache.org/debugger.html. This article will supplement the official documentation.

First, you need to import the camel-test package:
```xml
        <dependency>
            <groupId>org.apache.camel</groupId>
            <artifactId>camel-test</artifactId>
            <version>2.16.2</version>
        </dependency>
```
Then create a new class and implement CamelTestSupport.
```java
public class CamelDebugger extends CamelTestSupport {
```
CamelTestSupport has many methods, and you can choose some to implement as needed. Here are some of the more important ones:

1. createCamelContext() - This method allows you to define your own camelContext for testing.

2. createRouteBuilder() - This method uses the default camelContext but adds your own route.

3. debugBefore and debugAfter - These two methods are executed before and after a message is processed respectively, with parameters including exchange, processor, and other necessary information. During actual debugging, this is where you write logs or set breakpoints.

For specific example code, see: https://github.com/lcy362/CamelDemo/blob/7aef2cc7661236499896022f6976c160b73b68e7/src/main/java/com/mallow/demo/camel/debugger/CamelDebugger.java
---
Source: https://lichuanyang.top/en/posts/1120/
