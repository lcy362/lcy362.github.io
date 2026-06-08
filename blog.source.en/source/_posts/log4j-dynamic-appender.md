---
title: Dynamically Adding Appenders to Log4j
description: "A practical example of dynamically modifying Log4j configuration through code, demonstrating runtime appender addition using KafkaAppender as an example."
keywords:
  - Log4j
  - appender
  - KafkaAppender
  - dynamic configuration
categories:
  - Java
tags:
  - logging
abbrlink: 42764
cover: /img/42764.png
date: 2017-06-30 19:30:00
---
In addition to configuring Log4j through configuration files in formats such as properties and XML, Log4j also provides various interfaces that allow you to dynamically modify Log4j configuration using code, such as adding an appender to a logger. The method is straightforward: create a new appender and add it to the logger. Here is a sample code:

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

This example uses a KafkaAppender, but other appenders such as DailyRollingFileAppender work in a similar way.

---

Source: https://lichuanyang.top/en/posts/42764/
