---
title: 'java日志系统简介: 从tomcat大量打印debug日志说起'
description: "从 Tomcat debug 日志问题切入，介绍 Java 两大日志体系（log4j 和 slf4j+logback）的架构和互操作。"
keywords:
  - Java日志
  - log4j
  - slf4j
  - logback
  - Tomcat
categories:
  - Java
tags:
  - java
  - 日志
abbrlink: 4433
cover: /img/4433.png
date: 2017-03-31 19:47:00
---
目前，java下应用最广泛的日志系统主要就是两个系列: log4j和slf4j+logback 。

其中,slf4j只包含日志的接口，logback只包括日志的具体实现，两者加起来才是一个完整的日志系统。Log4j则同时包含了日志接口和实现。

这两套日志系统之间有可以相互兼容的组件，分别是slf4j-log4j12和 log4j-over-slf4j，引入之后就可以用log4j打出slf4j接口的日志，或者用logback打出log4j接口的日志。

背景知识介绍到这里，再简单说一下标题里提到的问题。问题的现象就是我们在war包里配置了log4j的日志级别为info, 但在catalina里却一直在打大量的debug日志。初看现象肯定很诡异，前期各种研究tomcat配置也没什么头绪。直到磁盘压力太大，去看jstack发现大量进程是等待在Logback代码中，才发现之前关注错了重点。再去具体了解了java下的日志系统后，问题也就很明了了。

先把几个事实摆出来：
	1\. 打出的debug日志都是用slf4j写的，根据堆栈得知logback具体执行了日志打印
	2\. logback在无配置文件时默认debug级别
	3\. 我们的war包中同时包含logback,log4j和slf4j-log4j12
	4\. Slf4j无法主动选择具体的日志实现
想必看到这里，大家也明白了问题所在。根据我们引入的包，log4j和logback都可以实现打印slf4j日志，而具体谁来打，不是一个用正常办法可以控制的事情，在这个具体案例下，logback就成了具体的日志打印者。而因为我们其实是想用lo4j打日志，所以没有配logback配置，所以logback就按默认的debug级别打了大量日志。

解决办法也很简单，就是把logback的包全去掉。看似有些暴力，但确实是最合理的一个解决办法。

最后提供一个排查日志问题的通用套路，免得找不到方向乱看。
	1\. 找几行不符合自己日志配置的具体日志，翻阅对应代码，看看是哪个日志接口打的
	2\. 查jar包，看看这套日志框架有哪些具体实现
        3\. 把多的jar包去掉
---
