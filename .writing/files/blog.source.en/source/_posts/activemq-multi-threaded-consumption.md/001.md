---
title: ActiveMQ Multi-threaded Consumption - Different Approaches
description: "Comparing three approaches to implementing multi-threading on the ActiveMQ consumer side (multiple connections, multiple sessions, multiple consumers), and analyzing their performance differences."
keywords:
  - ActiveMQ
  - multi-threaded consumption
  - message queue
  - performance optimization
tags:
  - activemq
categories:
  - ActiveMQ Series
abbrlink: 20459
cover: /img/20459.jpg
date: 2018-09-16 09:58:11
---
In a [previous article](https://lichuanyang.top/posts/48216/), I introduced the basic syntax for using ActiveMQ on the client side.

It is worth noting the consumer side:
<!-- more -->
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

As you can see, there are actually three ways to achieve multi-threaded consumption of the same queue: defining multiple connections, sessions, and consumers. At the application level, these three approaches produce the same effect — they all generate multiple consumers to process messages in the queue in parallel. However, in terms of performance, there are noticeable differences among these three approaches. Let's elaborate below.

First, defining multiple consumers is only a form of **pseudo-parallelism** and does not achieve true concurrent consumption. The reason is that in the JMS protocol, a session can only be used by one thread at a time. So when multiple consumers share the same session, they simply take turns using that one session.

Multiple sessions and multiple connections, on the other hand, are truly concurrent operations. A connection corresponds to a physical TCP connection. One connection can create multiple sessions, and these sessions share the same TCP connection. The difference between multiple sessions and multiple connections is simply whether you open one or multiple TCP connections. The impact is easy to understand: multiple TCP connections can handle greater network traffic, but of course they also bring some overhead in establishing and maintaining connections.

**In summary**, in most cases, you can define multiple sessions to achieve parallel consumption in ActiveMQ. When traffic is high, you can consider opening multiple connections. As for multiple consumers, I have not yet found a scenario where that would be useful.

Source: https://lichuanyang.top/en/posts/20459/
---
