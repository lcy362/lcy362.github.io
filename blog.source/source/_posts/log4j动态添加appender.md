---
title: log4j动态添加appender
description: "通过代码动态修改 Log4j 配置的实战示例，以 KafkaAppender 为例演示运行时添加 appender。"
tags:
  - 日志
abbrlink: 42764
date: 2017-06-30 19:30:00
---

除了通过properties，xml等格式的配置文件对log4j进行配置外，log4j还提供了各种接口，可以用代码动态修改log4j的配置，例如给一个logger增加一个appender。方法很简单，就是新建一个appder，然后添加到logger上，示例代码如下：
```
        KafkaLog4jAppender kafkaAppender = new KafkaLog4jAppender();
        kafkaAppender.setBrokerList(broker);
        kafkaAppender.setTopic(topic);
        kafkaAppender.setCompressionType("gzip");
        kafkaAppender.setSyncSend(false);
        kafkaAppender.setLayout(new PatternLayout(layout));
        kafkaAppender.activateOptions();
        logger.addAppender(kafkaAppender);
        logger.setLevel(Level.INFO);
```
这里以一个kafkaappender做例子，其他的，例如DailyRollingFileAppender等，都是类似的。