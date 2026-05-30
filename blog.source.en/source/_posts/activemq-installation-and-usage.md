---
title: ActiveMQ Installation and Basic Usage
description: "ActiveMQ installation and deployment, core configuration file explanation, and basic API usage tutorial, suitable for beginners."
keywords:
  - ActiveMQ
  - installation
  - JMS
  - messaging middleware
  - getting started
tags:
  - activemq
categories:
  - activemq series
abbrlink: 48216
date: 2018-01-30 08:46:07
---
## Installation
Download the latest version from the [official website](http://activemq.apache.org/download.html), extract it, and the only prerequisite is to install JDK. Starting from ActiveMQ 5.14, only JDK 8 is supported.

## Configuration
The core configuration file is `activemq.xml` in the `conf` directory. The default configuration can be used without modification. Other configuration details will be introduced in subsequent articles when discussing the various features of ActiveMQ.

## Starting
Run `activemq start` in the `bin` directory. After starting, open `localhost:8161` in a browser to access the web management console.

## Basic API Usage
This section only introduces the API usage under Java. ActiveMQ's default OpenWire protocol only supports Java because the implemented JMS protocol is a Java-based protocol. If you need access from other languages, you can use protocols such as STOMP or AMQP.

### Dependency
Include the official ActiveMQ client package.

```xml
		<dependency>
			<groupId>org.apache.activemq</groupId>
			<artifactId>activemq-client</artifactId>
		</dependency>
```

The main steps for sending and receiving messages in ActiveMQ are similar. You need to first establish a connection, then create a session, and then create the required producer or consumer.

The example code is as follows:

### Sending Messages
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

### Receiving Messages
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

Multiple connections, sessions, and consumers can be created to achieve parallel consumption. Generally, you need to use multiple connections or multiple sessions, because with multiple consumers sharing a single session, they simply take turns using the session — it is not true parallel consumption. As for the choice between connections and sessions, it generally depends on specific traffic requirements. One connection corresponds to one physical TCP connection.

Producers work similarly, but parallel message sending is generally not very useful, so the code is not included here.

### Browsing Messages
ActiveMQ provides a useful feature called **Browser**, which works similarly to a consumer but does not actually consume messages — it only previews the message content.

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

Source: https://lichuanyang.top/en/posts/48216/
---
