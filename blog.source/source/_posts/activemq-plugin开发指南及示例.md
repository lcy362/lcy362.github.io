---
title: activemq plugin开发指南及示例
description: "ActiveMQ 插件(plugin)开发的完整指南，介绍如何通过插件机制方便地添加自定义功能，比直接修改源码更安全高效。"
keywords:
  - ActiveMQ
  - plugin
  - 插件开发
  - JMS
categories:
  - 消息队列
tags:
  - activemq
abbrlink: 61645
cover: /img/61645.jpg
tldr: ActiveMQ插件机制让消息中间件的功能可以按需扩展
date: 2017-05-05 16:58:00
---
activemq提供了一种插件(plugin)开发的机制(http://activemq.apache.org/developing-plugins.html), 可以方便的添加各种自定义功能。其效果类似于直接去修改activemq的源码，无论从方便性还是风险程度上，使用plugin都要比去修改源码要好很多。通过这种方式，理论上我们可以实现几乎所有能想到的功能。

## 开发指南
首先需要在工程中添加activemq的依赖，为了方便，可以直接用activemq-all包。
```xml
        <dependency>
            <groupId>org.apache.activemq</groupId>
            <artifactId>activemq-all</artifactId>
            <version>5.13.2</version>
        </dependency>
```
Actviemq plugin的开发非常方便，只需要实现两个类。

一个是plugin类， 需要implements BrokerPlugin这个接口，然后将接口的installPlugin方法实现了即可。

这个方法的唯一作用就是指定一个broker类，代码如下：
```java
    public Broker installPlugin(Broker broker) throws Exception {
        return new LimitQueueSIzeBroker(broker);
    }
```

接下来就是在实现一个broker类，一般情况下可以extends BrokerFilter 这个类，然后选择需要的方法重写，构造方法和重写的每个方法执行完毕后，执行以下super类的对应方法，这样就不会对activemq的实际运行造成影响。

例如：
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

这里我们重写了activemq的send方法, 并且增加了一些日志。

然后打包，将jar包放到activemq的lib目录下。再在activemq.xml下增加plugins这个模块，并把需要的插件依次列在里边。

```xml
<plugins>
	<bean xmlns="http://www.springframework.org/schema/beans" id="testPlugin" class="com.mallow.activemq.FoxBrokerPlugin"/>
	<bean xmlns="http://www.springframework.org/schema/beans" id="purgePlugin" class="com.mallow.activemq.LimitQueueSizePlugin"/>
</plugins>
```
重启activemq,再收发消息的时候就能看到效果了。

## 例子
可以参考我在github上放的代码： https://github.com/lcy362/FoxActivemqPlugin

里边提供了两个非常简单的插件示例。FoxBrokerPlugin会在收发消息时记录生产者、消费者的ip; LimitQueueSizePlugin则可以控制队列大小，队列中积压1000条消息以后新的消息就会被丢弃，在测试环境下会比较有用。

此外，activemq自己也提供了几个常用的插件，包括LoggingBrokerPlugin， StatisticsBrokerPlugin, 等， 也可以参考他们的实现。
---
