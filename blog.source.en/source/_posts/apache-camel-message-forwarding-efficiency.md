---
title: About Apache Camel's Message Forwarding Efficiency
description: "Analyzes the working principle and efficiency bottlenecks of Apache Camel message forwarding, providing insights for performance optimization in high-data-volume scenarios."
keywords:
  - Apache
  - Camel
  - message forwarding
  - performance
  - ActiveMQ
categories:
  - Message Queue
tags:
  - java
  - camel
abbrlink: 17762
cover: /img/17762.png
date: 2015-08-08 20:55:00
---
<span style="font-family: Arial,Helvetica,sans-serif; background-color: #ffffff;">The company uses ActiveMQ and Camel for message distribution. Previously, the data volume wasn't very large, so we never really considered efficiency issues, and the research into Camel's working principles wasn't deep. However, recently, as the business volume increased, Camel's efficiency has gradually become a bottleneck, so I got a general understanding of Camel's working principles based on logs. Although Camel is embedded into ActiveMQ, during the working process, Camel and ActiveMQ are actually relatively independent. We configure a connection to ActiveMQ in Camel.</span>

<pre name="code" class="html">http://camel.apache.org/activemq.html

</pre>

Regarding the VM transport method, refer to [http://activemq.apache.org/vm-transport-reference.html](http://activemq.apache.org/vm-transport-reference.html)

After checking the logs, I found that with this configuration, Camel has a very serious problem: every time Camel performs a forwarding operation, it creates a new connection to ActiveMQ and then closes it. This severely slows down the forwarding efficiency, since in fact, the same connection could be reused for every forwarding operation.

So I looked up the Camel documentation and found [http://camel.apache.org/activemq.html](http://camel.apache.org/activemq.html). It contains configuration for thread pools:

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

This fits our needs exactly. And by switching the connection to multi-threaded, we can further improve efficiency.

&nbsp;

It's worth noting that if you're using ActiveMQ 5.6, doing this will cause a memory leak. I will elaborate on this in the next blog post.

&nbsp;
---
Source: https://lichuanyang.top/en/posts/17762/

---
