---
title: ActiveMQ 5.6 Connection Pool Memory Leak Issue
description: "Documenting a severe memory leak issue in ActiveMQ 5.6 connection pool, using jmap monitoring to locate abnormal growth of ReentrantLock and PooledConnection."
keywords:
  - ActiveMQ
  - connection pool
  - memory leak
  - ReentrantLock
  - bug
categories:
  - Message Queue
tags:
  - activemq
abbrlink: 13925
date: 2015-08-08 21:16:00
---
Recently, while using ActiveMQ's connection pool, I discovered a very serious memory leak issue.

Through jmap monitoring, it can be seen that `java.util.concurrent.locks.ReentrantLock` and `org.apache.activemq.pool.PooledConnection` occupy a very large amount of memory, and the growth rate is also very fast.

After searching online, I found exactly the corresponding ActiveMQ [bug report](https://issues.apache.org/jira/browse/AMQ-3997): https://issues.apache.org/jira/browse/AMQ-3997

This bug has been fixed in version 5.7, so it can be resolved by upgrading the version.

At the same time, there is another solution, which is to use Spring's connection pool to replace ActiveMQ's built-in connection pool. The configuration is as follows:

```xml
  <bean id="jmsConnectionFactory"
                class="org.apache.activemq.ActiveMQConnectionFactory">
                <property name="brokerURL" value="vm://205-amq-broker2?create=false&amp;waitForStart=10000" />
        </bean>

<!--        <bean id="pooledConnectionFactory"
                class="org.apache.activemq.pool.PooledConnectionFactory" init-method="start" destroy-method="stop">
                <property name="maxConnections" value="8" />
                <property name="connectionFactory" ref="jmsConnectionFactory" />
        </bean>-->
      <bean id="cachedConnectionFactory"
                class="org.springframework.jms.connection.CachingConnectionFactory">
                        <property name="targetConnectionFactory" ref="jmsConnectionFactory"></property>
                        <property name="sessionCacheSize" value="10"></property>
        </bean>
        <bean id="jmsConfig"
                class="org.apache.camel.component.jms.JmsConfiguration">
                <property name="connectionFactory" ref="cachedConnectionFactory"/>
                <property name="concurrentConsumers" value="10"/>
        </bean>

        <bean id="activemq"
                class="org.apache.activemq.camel.component.ActiveMQComponent">
                <property name="configuration" ref="jmsConfig"/>
```

---
Source: https://lichuanyang.top/en/posts/13925/
