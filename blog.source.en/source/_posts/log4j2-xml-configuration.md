---
title: Log4j2 XML Configuration Examples and Differences from Log4j
description: "Practical Log4j2 XML configuration examples, comparing the major changes from Log4j: new node naming, attribute configuration approach, and archive compression support."
keywords:
  - Log4j2
  - XML configuration
  - logging framework
  - archive compression
categories:
  - Java
tags:
  - logging
abbrlink: 41673
cover: /img/41673.jpg
date: 2017-04-10 20:23:00
tldr: Log4j 2 is faster, more flexible, and has fixed security vulnerabilities compared to 1.x. New projects should prefer the SLF4J + Log4j 2 combination
---
## Complete Configuration Example

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

## Key Differences from Log4j 1.x

Compared to Log4j, there are several major changes:

First, the overall structure has changed significantly — appenders and loggers are now each organized under their own root nodes.

The XML node names have also been redesigned to use descriptive names directly, instead of the previous `appender xxx="xxx"` and `param xxx="xxx"` format.

Additionally, certain attributes such as `fileName` can only be configured as node attributes, not as child nodes as was possible in Log4j.

Furthermore, Log4j2 supports compression when archiving. By specifying a compressed file extension such as `.gz` or `.zip` in the `filePattern` attribute of the `RollingFile` node, Log4j2 will automatically select the appropriate compression algorithm.

## Dependencies and Migration

That covers the main differences I've discovered so far. By importing this XML configuration along with the `log4j-core` and `log4j-api` packages, you can start using Log4j2. Additionally, if needed, you can use `log4j-slf4j-impl`, `log4j-jcl`, and `log4j-1.2-api` to achieve compatibility with SLF4J, JCL, and Log4j respectively.

---

Source: https://lichuanyang.top/en/posts/41673/
