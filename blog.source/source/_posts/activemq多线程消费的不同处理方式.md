---
title: activemq多线程消费的不同处理方式
description: "对比 ActiveMQ 消费端实现多线程的三种方式（多 connection、多 session、多 consumer），分析它们在性能上的差异。"
tags: activemq
categories: activemq系列文章
abbrlink: 20459
date: 2018-09-16 09:58:11
---

之前在[另一篇文章](https://lcy362.github.io/posts/48216/)里介绍过使用activemq时，client端的基本语法。

值得注意的是消费者，
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
可以看到，实际上有三种方式都可以实现多线程消费同一队列，分别是定义多个connection, session和consumer。这三种方式在应用层面的效果是一样的，都是会生成多个消费者，并行处理队列中的消息。但是在性能上，这三种方式会有较明显的差别。下边详细介绍一下。

首先，定于多个consumer只是一种伪并行，并没有真正并发消费。原因是在JMS协议列，一个session在同一时间点只能被一个线程使用，所以多consumer复用同一session时，只是这些consumer轮流使用这一个session。

而可以考虑开多个connection对应的是物理的tcp连接，一个producer可以新建多个session，这些session就是复用同一个tcp链接。多session和多可以考虑开多个connection都是真正的并发操作，区别只在于是开一个还是多个tcp连接。这个造成的影响很容易理解，多个tcp连接，可以处理更大的网络流量，当然在建立、维护连接时也会带来一定开销。

总的来说，大部分情况下，我们可以定义多session来实现activemq的并行消费。在流量较大时，可以考虑开多个connection。而多个consumer, 目前没有想出有什么场景能用到。



原文链接：https://lcy362.github.io/posts/20459/