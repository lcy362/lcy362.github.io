---
title: activemq的安装及基本使用
description: "ActiveMQ 的安装部署、核心配置文件说明，以及基本 API 使用教程，适合入门学习。"
keywords:
  - ActiveMQ
  - 安装
  - JMS
  - 消息中间件
  - 入门
tags:
  - activemq
categories:
  - activemq系列文章
abbrlink: 48216
date: 2018-01-30 08:46:07
---
## 安装
从[官网](http://activemq.apache.org/download.html)下载最新版本，解压，其他的前期准备只需要安装jdk。 从activemq 5.14开始，只支持jdk8。

## 配置
核心配置文件是conf目录下的activemq.xml, 默认的配置无需修改即可使用,其他配置我们会在后续文章介绍activemq各种特性时详细介绍。

## 启动
bin目录下运行` activemq start` 即可 ，启动之后浏览器打开localhost:8161 可以打开web管理页面。

## 基本api使用
这里只介绍java下的api使用，activemq默认的openwire协议是只支持java的，因为实现的JMS协议是java下的协议。如果有其他语言的访问需求，可以用stomp,amqp等协议。

### 依赖包
引入activemq官方的client包。

```xml
		<dependency>
			<groupId>org.apache.activemq</groupId>
			<artifactId>activemq-client</artifactId>
		</dependency>
```

actibemq收发消息的主要步骤类似，都需要先建立连接，然后建立会话，然后再新建需要的producer,consumer. 

示例代码如下

### 发送消息
```java
public void produce() throws JMSException {
        ActiveMQConnectionFactory cf = new ActiveMQConnectionFactory();
        cf.setBrokerURL("tcp://localhost:61616");
        Connection connection = cf.createConnection();
        connection.start();
        Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
        Queue queue = session.createQueue("TEST");
        MessageProducer producer = session.createProducer(queue);
        TextMessage message = session.createTextMessage("123");
        producer.send(message);
    }
```

### 接收消息
```java
    public void consume() throws JMSException {
        ActiveMQConnectionFactory cf = new ActiveMQConnectionFactory();
        cf.setBrokerURL("tcp://localhost:61616");
        Connection connection = cf.createConnection();
        connection.start();
        Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
        Queue queue = session.createQueue("TEST");
        MessageConsumer consumer = session.createConsumer(queue);

//        Message message = consumer.receive();
//        TextMessage textMessage = (TextMessage) message;
//        System.out.println(textMessage.getText());

        consumer.setMessageListener(message -> {
            try {
                System.out.println("consumer1: " + ((TextMessage) message).getText());
            } catch (JMSException e) {
                e.printStackTrace();
            }
        });

        Session session2 = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
        Queue queue2 = session2.createQueue("TEST");
        MessageConsumer consumer2 = session2.createConsumer(queue2);
        consumer2.setMessageListener(message -> {
            try {
                System.out.println("consumer2: " + ((TextMessage) message).getText());
            } catch (JMSException e) {
                e.printStackTrace();
            }
        });

        Queue queue3 = session2.createQueue("TEST");
        MessageConsumer consumer3 = session2.createConsumer(queue3);
        consumer3.setMessageListener(message -> {
            try {
                System.out.println("consumer3: " + ((TextMessage) message).getText());
            } catch (JMSException e) {
                e.printStackTrace();
            }
        });

        try {
            TimeUnit.MINUTES.sleep(100);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

    }
```

connection,session,consumer都可以创建多个，实现并行消费。一般来说需要使用多connection或者多session,因为只是多consumer的话，共用一个session,只是多个consumer轮流执行而已，不是真正的并行消费。至于connection和session的选择，一般看具体的流量需求。一个connection对应的是一个物理的tcp连接。

producer其实也类似，只是一般并行发消息意义不大，所以就不贴代码了。

### 浏览消息
activemq提供了一个有用的功能，brower, 作用与consumer类似，只是不会真正将消息消费掉，只是预览消息内容。

```java
public void brower() throws Exception{
        ActiveMQConnectionFactory cf = new ActiveMQConnectionFactory();
        cf.setBrokerURL("tcp://localhost:61616");
        Connection connection = cf.createConnection();
        connection.start();
        Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
        Queue queue = session.createQueue("TEST");
        QueueBrowser browser = session.createBrowser(queue);
        Enumeration<?> enumeration = browser.getEnumeration();
        while (enumeration.hasMoreElements()) {
            TextMessage message = (TextMessage) enumeration.nextElement();
            System.out.println("Browsing: " + message.getText());
        }

    }
```

原文地址： https://lcy362.github.io/posts/48216/
---
