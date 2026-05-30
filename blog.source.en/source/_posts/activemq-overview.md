---
title: ActiveMQ Series - Overview
description: "The opening article of the ActiveMQ messaging middleware series, introducing the core functions of messaging middleware (decoupling and peak shaving) as well as the basic concepts of the JMS protocol."
keywords:
  - ActiveMQ
  - messaging middleware
  - JMS
  - decoupling
  - peak shaving
tags:
  - activemq
categories:
  - ActiveMQ Series
abbrlink: 12035
date: 2018-01-22 18:33:02
---
ActiveMQ is a messaging middleware (MOM) based on the JMS protocol. When introducing ActiveMQ, we inevitably need to talk about messaging middleware and JMS.

Messaging middleware is a very common component in distributed systems, providing a flexible mechanism to integrate different applications. Applications do not communicate directly with each other, but instead communicate through the messaging middleware acting as an intermediary.

Messaging middleware serves two main purposes: **decoupling** and **peak shaving**, both of which are common challenges in large-scale systems.

**Decoupling** means maintaining relative independence among applications within a system. For example, when a user logs in, multiple applications may need to trigger various actions such as recommendations, sending messages, and so on. These actions are unrelated to the login operation itself. If all of them were handled in the login module, it would clearly be inappropriate and the user experience would be very poor. In this case, a message can be sent during login, and other systems can listen to this message and handle their respective business logic accordingly.

**Peak shaving** is designed to handle sudden traffic spikes. After all, system resources cannot be allocated based on maximum demand. If traffic is too high in a short period, messages can remain in the messaging middleware first, and the business can process them gradually.

Messaging middleware generally has two delivery modes: **Point-to-Point (P2P)** and **Publish-Subscribe (Pub/Sub)**.

Point-to-Point mode is called **Queue** in JMS, with three main characteristics:

1. Each message has only one consumer.
2. There is no temporal dependency between the sender and receiver. That is, after the sender sends a message, it does not affect the message being delivered to the queue regardless of whether the receiver is running.
3. The receiver needs to send an acknowledgment (ack) signal to the queue after successfully receiving a message.

Publish-Subscribe mode corresponds to **Topic** in JMS. In contrast to the point-to-point mode, it has the following characteristics:

1. Each message can be consumed by multiple consumers.
2. There is a temporal dependency between the publisher and subscriber. A subscriber for a specific topic must create a subscriber before it can consume the publisher's messages, and in order to consume messages, the subscriber must remain in a running state.

JMS is a standard messaging API defined by Sun. JMS itself is not a messaging system; it is an abstraction of the interfaces and classes needed for messaging clients to communicate with messaging systems. It is similar to JDBC, JNDI, and others.

JMS specifies the message structure, connections, sessions, producers, consumers, and more.

ActiveMQ is a concrete implementation of JMS 1.1. In subsequent articles, we will provide a comprehensive introduction to the installation, usage, and various features of ActiveMQ.

Source: https://lichuanyang.top/en/posts/12035/
---
