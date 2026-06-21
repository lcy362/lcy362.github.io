---
title: 关于rocketmq的readQueue和writeQueue
description: "解释 RocketMQ 中 MessageQueue 为什么要拆分成 readQueue 和 writeQueue 的设计原因。"
keywords:
  - RocketMQ
  - MessageQueue
  - readQueue
  - writeQueue
categories:
  - 消息队列
tags:
  - rocketMq
  - 消息队列
abbrlink: 32580
cover: /img/32580.jpg
date: 2019-05-18 15:23:02
---
解释一下rocketMq里的messageQueue为什么要拆分成writeQueue和readQueue.
<!-- more -->

首先，简单介绍一下rocketmq的queue是什么，从网上找了一个rocketMq的架构图。
![rocketMq架构](/img/rocketmq_model.jpeg)
我们知道，使用rocketMq时，我们都是针对一个topic区进行生产或者消费。而messageQueue就是topic的一部分，类似于kafka中分区的概念。queue是consumer消费时的最小单元，也就是说，consumer的数量无法高于queue的数量。

rocketMq中有很特殊的一点是分了writeQueue和readQueue。其实，在绝大对数情况下，这两件事是无法分开的，如果readQueue和writeQueue的数量不一致，会产生非常严重的问题。例如，writeQueue的数量高于readQueue, 就说明有些queue只有写没有读，也就是说会有一部分消息永远都不会消费掉。readQueue多于writeQueue的话，就说明有一部分consumer处在空跑的状态，不可能接收到消息。

那么，rocketMq这么设计的意义在哪里呢。其实，拆分readQueue和writeQueue, 目的就是能让扩容或缩容的过程更加平滑。以扩容为例，可以先增加readQueue的数量，这时候consumer已经能关联到queue上，然后再去修改writeQueue,因为consumer已经扩容完成了，进入新的queue的消息马上就可以被消费掉。这样整个过程就非常平滑且健壮，所有消息都可以及时交给consumer. 

大家可以考虑一下如果没有这样的机制应该如何去设计扩容或者缩容的流程，其实，无论如何都会造成一些消息无法被及时处理。说明这种设计是非常巧妙的。

原文地址: https://lichuanyang.top/posts/32580/

---
