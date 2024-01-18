---
title: log4j2.xml配置示例及与log4j的区别
tags:
  - 日志
abbrlink: 41673
date: 2017-04-10 20:23:00
---

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<configuration status="warn">

    <Appenders>
        <Console name="Console" target="SYSTEM_OUT">
            <PatternLayout pattern="[%p] %d %c %l - %m%n"/>
        </Console>

        <RollingFile name="activity" fileName="/opt/fox.log"
                     filePattern="/opt/fox.log.%d{yyyy-MM-dd}.gz">
            <Policies>
                <TimeBasedTriggeringPolicy interval="1" modulate="true"/>
            </Policies>
            <PatternLayout pattern="[%p] %d - %m%n" charset="UTF-8"/>
        </RollingFile>
        <RollingFile name="fox_err" fileName="/opt/fox_err.log"
                     filePattern="/opt/fox_err..log.%d{yyyy-MM-dd}.gz">
            <Policies>
                <TimeBasedTriggeringPolicy interval="1" modulate="true"/>
            </Policies>
            <PatternLayout pattern="[%p] %d %l - %m%n" charset="UTF-8"/>
        </RollingFile>
    </Appenders>
    <Loggers>
        <logger name="com.fox" additivity="false" level="info">
            <appender-ref ref="activity" />
            <appender-ref ref="activity_err" level="error"/>
        </logger>
        <Root level="error">
            <AppenderRef ref="Console"/>
        </Root>
    </Loggers>

</configuration>

```

和log4j相比，主要有这么一些变化，

首先整体结构上变化很大，appender、logger都被集中到了各自的一个根节点下。

xml各节点的名称也采用了新设计，名称直接就是有用信息，不再是之前appender xxx="xxx", param xxx="xxx"的形式。

然后一些属性，包括fileName等，只能作为节点属性配置，不能像log4j那样配置成子节点。

此外，log4j2归档时支持压缩，在RollingFile节点的filePattern属性里将文件名后缀写成gz,zip等压缩格式，log4j2会自动选择相应压缩算法进行压缩。

现在发现的就这些，引入这个xml配置，再引用log4j-core， log4j-api包，就可以使用log4j2了。此外，如果有需要，可以用log4j-slf4j-impl，log4j-jcl，log4j-1.2-api分别实现对slf4j, jcl,log4j的兼容。