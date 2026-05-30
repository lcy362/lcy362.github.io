---
title: Embedding Hawtio Monitoring in a Standalone Java Application
description: "A complete guide to embedding Hawtio monitoring in a standalone Java application for viewing JMX and other monitoring data directly."
keywords:
  - Hawtio
  - JMX
  - Java monitoring
  - embedded
categories:
  - Java
tags:
  - java
  - hawtio
  - monitoring
abbrlink: 11299
date: 2017-04-01 19:42:00
---
Hawtio (hawt.io) is an open-source monitoring system that provides multiple startup methods. It can run as a standalone JAR or WAR package and remotely connect to other applications for monitoring, or it can be directly embedded into our own applications.

<!-- more -->

This article introduces how to embed Hawtio in a standalone Java application, corresponding to the official documentation (http://hawt.io/getstarted/index.html) section "Using hawtio inside a stand alone Java application". However, that section of the documentation has quite a few issues — if you only follow that section, you'll encounter various problems.

Below are the detailed steps.

## Adding Dependencies
In addition to the `hawtio-embedded` mentioned in the official documentation, the `hawtio-insight-log`, `hawtio-core`, and `hawtio-web` packages are all required. We use the latest versions available at the time.

```xml
        <dependency>
            <groupId>io.hawt</groupId>
            <artifactId>hawtio-embedded</artifactId>
            <version>2.0.0</version>
        </dependency>
        <dependency>
            <groupId>io.hawt</groupId>
            <artifactId>hawtio-insight-log</artifactId>
            <version>1.5.0</version>
        </dependency>
        <dependency>
            <groupId>io.hawt</groupId>
            <artifactId>hawtio-core</artifactId>
            <version>2.0.0</version>
        </dependency>
        <dependency>
            <groupId>io.hawt</groupId>
            <artifactId>hawtio-web</artifactId>
            <version>2.0.0</version>
        </dependency>
```

## Downloading the WAR Package
Also from the official getting started documentation (http://hawt.io/getstarted/index.html), download the `hawtio-default.war` package and place it anywhere. The WAR file name can be changed to anything you like.

## Code
The basic code is very simple if no additional configuration is needed:

```java
            Main main = new Main();
            main.setWar("hawtio.war");
            main.run();
```

The `main.setWar` method configures the specific path to the WAR package. It can be inside or outside the project directory. Note that it is NOT "the directory path containing the Hawtio WAR" as stated in the official documentation.

Then run `main.run()` to start Hawtio.

## Authentication
Newer versions of Hawtio require a password by default. For simplicity, you can add a JVM parameter to disable authentication:

```
-Dhawtio.authenticationEnabled=false
```

Example code can be found on GitHub (https://github.com/lcy362/CamelDemo/blob/master/src/main/java/com/mallow/demo/camel/MainWithHawtio.java). It can be downloaded and run directly, but you'll need a local ActiveMQ instance. The example demonstrates using Hawtio to monitor Apache Camel. After startup, the Camel tab will appear directly in the Hawtio web interface, making it very convenient to use.

Source: https://lichuanyang.top/en/posts/11299/
