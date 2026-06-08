---
title: About RocketMQ's readQueue and writeQueue
description: "Explains why RocketMQ splits MessageQueue into readQueue and writeQueue in its design."
keywords:
  - RocketMQ
  - MessageQueue
  - readQueue
  - writeQueue
categories:
  - Message Queue
tags:
  - rocketmq
  - message-queue
abbrlink: 32580
cover: /img/32580.png
date: 2019-05-18 15:23:02
---
Explaining why MessageQueue in RocketMQ is split into writeQueue and readQueue.
<!-- more -->

First, let me briefly introduce what a queue in RocketMQ is. Here is an architecture diagram of RocketMQ found online.
![RocketMQ Architecture](/img/rocketmq_model.jpeg)
As we know, when using RocketMQ, we produce or consume against a specific topic. MessageQueue is a part of a topic, similar to the concept of partitions in Kafka. A queue is the minimum unit for consumer consumption, meaning the number of consumers cannot exceed the number of queues.

A very special aspect of RocketMQ is that it splits into writeQueue and readQueue. In most cases, these two things cannot be separated. If the number of readQueues and writeQueues is inconsistent, very serious problems will occur. For example, if the number of writeQueues is greater than the number of readQueues, it means some queues are write-only with no reads, meaning some messages will never be consumed. If readQueues outnumber writeQueues, it means some consumers are in an idle state and will never receive messages.

So what is the purpose of this design in RocketMQ? The goal of splitting readQueue and writeQueue is to make the scaling up or scaling down process smoother. Taking scaling up as an example, you can first increase the number of readQueues. At this point, consumers can already be associated with queues. Then you can modify the writeQueues, since consumers have already completed their expansion, messages entering new queues can be consumed immediately. This makes the entire process very smooth and robust, with all messages being handed over to consumers promptly.

Think about how you would design the scaling up or scaling down process without such a mechanism — in any case, some messages would inevitably fail to be processed in time. This shows how clever this design is.

Source: https://lichuanyang.top/en/posts/32580/

---
