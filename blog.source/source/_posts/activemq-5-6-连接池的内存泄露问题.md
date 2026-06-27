---
title: activemq 5.6 连接池的内存泄露问题
description: "记录 ActiveMQ 5.6 连接池存在的严重内存泄露问题，通过 jmap 监控定位 ReentrantLock 和 PooledConnection 的异常增长。"
keywords:
  - ActiveMQ
  - 连接池
  - 内存泄露
  - ReentrantLock
  - bug
categories:
  - 消息队列
tags:
  - activemq
abbrlink: 13925
cover: /img/13925.jpg
date: 2015-08-08 21:16:00
---
## 问题现象

最近在使用activemq 的连接池时，发现它存在很严重的内存泄露问题。

## 排查过程

通过jmap监控，可以看到java.util.concurrent.locks.ReentrantLock,&nbsp;org.apache.activemq.pool.PooledConnection这两个类占用的空间非常大，而且增长速度也很快。

## 根因分析

网上查了一下，正好找到activemq的[bug 报告](https://issues.apache.org/jira/browse/AMQ-3997).:[https://issues.apache.org/jira/browse/AMQ-3997](https://issues.apache.org/jira/browse/AMQ-3997)

## 解决方案

这个bug 在5.7中已经修复，可以通过升级版本解决。

同时，也有另一种解决方式，就是使用spring带的连接池替换activemq自带的连接池，配置如下：

<pre name="code" class="html">  &lt;bean id="jmsConnectionFactory"
                class="org.apache.activemq.ActiveMQConnectionFactory"&gt;
                &lt;property name="brokerURL" value="vm://205-amq-broker2?create=false&amp;waitForStart=10000" /&gt;
        &lt;/bean&gt;

&lt;!--        &lt;bean id="pooledConnectionFactory"
                class="org.apache.activemq.pool.PooledConnectionFactory" init-method="start" destroy-method="stop"&gt;
                &lt;property name="maxConnections" value="8" /&gt;
                &lt;property name="connectionFactory" ref="jmsConnectionFactory" /&gt;
        &lt;/bean&gt;--&gt;
      &lt;bean id="cachedConnectionFactory"
                class="&lt;span style="color:#ff0000;"&gt;org.springframework.jms.connection.CachingConnectionFactory&lt;/span&gt;"&gt;
                        &lt;property name="targetConnectionFactory" ref="jmsConnectionFactory"&gt;&lt;/property&gt;
                        &lt;property name="sessionCacheSize" value="10"&gt;&lt;/property&gt;
        &lt;/bean&gt;
        &lt;bean id="jmsConfig"
                class="org.apache.camel.component.jms.JmsConfiguration"&gt;
                &lt;property name="connectionFactory" ref="cachedConnectionFactory"/&gt;
                &lt;property name="concurrentConsumers" value="10"/&gt;
        &lt;/bean&gt;

        &lt;bean id="activemq"
                class="org.apache.activemq.camel.component.ActiveMQComponent"&gt;
                &lt;property name="configuration" ref="jmsConfig"/&gt;</pre>

&nbsp;
---
