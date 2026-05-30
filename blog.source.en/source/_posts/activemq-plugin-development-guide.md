---
title: ActiveMQ Plugin Development Guide and Examples
description: "A complete guide to ActiveMQ plugin development, introducing how to conveniently add custom functionality through the plugin mechanism, which is safer and more efficient than directly modifying the source code."
keywords:
  - ActiveMQ
  - plugin
  - plugin development
  - JMS
categories:
  - Message Queue
tags:
  - activemq
abbrlink: 61645
date: 2017-05-05 16:58:00
---
ActiveMQ provides a plugin development mechanism (http://activemq.apache.org/developing-plugins.html) that allows you to conveniently add various custom functionalities. The effect is similar to directly modifying ActiveMQ's source code, but using plugins is much better than modifying source code in terms of both convenience and risk. In theory, we can implement almost any functionality imaginable through this approach.

## Development Guide

First, you need to add the ActiveMQ dependency to your project. For convenience, you can use the `activemq-all` package directly.

```xml
        <dependency>
            <groupId>org.apache.activemq</groupId>
            <artifactId>activemq-all</artifactId>
            <version>5.13.2</version>
        </dependency>
```

Developing an ActiveMQ plugin is very straightforward — you only need to implement two classes.

One is the plugin class, which needs to implement the `BrokerPlugin` interface, and then implement the `installPlugin` method.

The sole purpose of this method is to specify a broker class:

```java
    public Broker installPlugin(Broker broker) throws Exception {
        return new LimitQueueSIzeBroker(broker);
    }
```

Next, you need to implement a broker class. In most cases, you can extend the `BrokerFilter` class, override the methods you need, and after the constructor and each overridden method finishes execution, call the corresponding method on the superclass. This way, it won't affect ActiveMQ's actual runtime.

For example:

```java
    public FoxBroker(Broker next) {
        super(next);
    }

    @Override
    public void send(ProducerBrokerExchange producerExchange, Message messageSend) throws Exception {
        try {
            String ip = producerExchange.getConnectionContext().getConnection().getRemoteAddress();
            String destinationName = messageSend.getDestination().getPhysicalName();
            logger.info("send_" + destinationName + " "  + ip);
        } catch (Exception e) {
            logger.error("activemq send log error: " + e, e);
        }
        super.send(producerExchange, messageSend);
    }
```

Here we override ActiveMQ's `send` method and add some logging.

Then package it and place the JAR file in ActiveMQ's `lib` directory. Next, add the `plugins` module in `activemq.xml` and list the desired plugins inside:

```xml
<plugins>
	<bean xmlns="http://www.springframework.org/schema/beans" id="testPlugin" class="com.mallow.activemq.FoxBrokerPlugin"/>
	<bean xmlns="http://www.springframework.org/schema/beans" id="purgePlugin" class="com.mallow.activemq.LimitQueueSizePlugin"/>
</plugins>
```

Restart ActiveMQ, and you can see the effect when sending and receiving messages.

## Examples

You can refer to the code I have on GitHub: https://github.com/lcy362/FoxActivemqPlugin

It provides two very simple plugin examples. `FoxBrokerPlugin` logs the IP addresses of producers and consumers when sending and receiving messages. `LimitQueueSizePlugin` can control the queue size — when the queue accumulates 1000 messages, new messages will be discarded, which is quite useful in test environments.

Additionally, ActiveMQ itself provides several commonly used plugins, including `LoggingBrokerPlugin`, `StatisticsBrokerPlugin`, etc., which you can also reference for implementation.

---
Source: https://lichuanyang.top/en/posts/61645/
