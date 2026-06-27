---
title: 关于apache camel的消息转发效率
description: "分析 Apache Camel 消息转发的工作原理和效率瓶颈，为大数据量场景下的性能优化提供思路。"
keywords:
  - Apache
  - Camel
  - 消息转发
  - 性能
  - ActiveMQ
categories:
  - 消息队列
tags:
  - java
  - camel
abbrlink: 17762
cover: /img/17762.jpg
date: 2015-08-08 20:55:00
---
## 测试场景

<span style="font-family: Arial,Helvetica,sans-serif; background-color: #ffffff;">公司使用activemq和camel做消息的分发，之前数据量不是很大，所以一直没怎么考虑效率问题，对camel的工作原理研究也不深。单是最近随着业务量的增加，camel的效率逐渐成了瓶颈，所以根据日志大概了解了camel的工作原理。虽然camel是被嵌入到activemq中，但在工作过程中，camel和activemq其实还是相对独立的。我们在camel中会配置一个到activemq的连接.</span>

<pre name="code" class="html">http://camel.apache.org/activemq.html

</pre>

关于vm这种传输方式，参考[http://activemq.apache.org/vm-transport-reference.html](http://activemq.apache.org/vm-transport-reference.html)

## 瓶颈分析

看了下日志，发现这种配置下camel会有一个很严重的问题: camel每次执行转发操作时，都会新建一个到activemq的连接，之后再将其关闭。这严重拖慢了转发效率，因为事实上每次转发都可以使用同一个连接。

## 优化建议

因此查了一下camel文档，找到了 [ http://camel.apache.org/activemq.html](http://camel.apache.org/activemq.html) 。 里边有关于线程池的配置：

&nbsp;

<pre name="code" class="html">&lt;pre name="code" class="html"&gt;&lt;bean id="jmsConnectionFactory" 
   class="org.apache.activemq.ActiveMQConnectionFactory"&gt;
   &lt;property name="brokerURL" value="tcp://localhost:61616" /&gt;
&lt;/bean&gt;

&lt;bean id="pooledConnectionFactory" 
   class="org.apache.activemq.pool.PooledConnectionFactory" init-method="start" destroy-method="stop"&gt;
   &lt;property name="maxConnections" value="8" /&gt;
   &lt;property name="connectionFactory" ref="jmsConnectionFactory" /&gt;
&lt;/bean&gt;

&lt;bean id="jmsConfig" 
   class="org.apache.camel.component.jms.JmsConfiguration"&gt;
   &lt;property name="connectionFactory" ref="pooledConnectionFactory"/&gt;
   &lt;property name="concurrentConsumers" value="10"/&gt;
&lt;/bean&gt;

&lt;bean id="activemq" 
    class="org.apache.activemq.camel.component.ActiveMQComponent"&gt;
    &lt;property name="configuration" ref="jmsConfig"/&gt;

    &lt;!-- if we are using transacted then enable CACHE_CONSUMER (if not using XA) to run faster
         see more details at: http://camel.apache.org/jms
    &lt;property name="transacted" value="true"/&gt;
    &lt;property name="cacheLevelName" value="CACHE_CONSUMER" /&gt;
    --&gt;
&lt;/bean&gt;</pre>

这个正好符合我们的需要。而且顺便把连接换成了多线程，可以进一步提升效率。

&nbsp;

需要注意的是，如果使用的是activemq5.6, 这样做会导致内存泄露，我会在下一篇博客中详述。

<pre></pre>

&nbsp;
---
