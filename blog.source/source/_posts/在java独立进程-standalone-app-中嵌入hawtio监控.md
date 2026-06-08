---
title: 在java独立进程(standalone app)中嵌入hawtio监控
description: "在 Java 独立应用中嵌入 Hawtio 监控系统的完整指南，实现应用内直接查看 JMX 等监控数据。"
keywords:
  - Hawtio
  - JMX
  - Java监控
  - 嵌入式
categories:
  - Java
tags:
  - java
  - hawtio
  - 监控
abbrlink: 11299
cover: /img/11299.png
date: 2017-04-01 19:42:00
---
hawtio(hawt.io)是一个开源的监控系统，它提供了多种启动方式，可以运行单独的jar包、war包，然后远程连接其他应用进行监控，也可以将它直接嵌到我们自己的应用中。

本文会介绍在一个单独的java进程(java standalone application)中嵌入hawtio，对应官方文档（http://hawt.io/getstarted/index.html）的 "Using hawtio inside a stand alone Java application",不过这一节文档问题是比较多的，如果你只看这段，会遇到各种问题。

下面介绍具体步骤

## 引入jar包
除了官方文档里说的hawtio-embedded外，hawtio-insight-log，hawtio-core，hawtio-web这几个包都是必需的，我们都引入当前的最新版本.
```
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
## 下载war包
同样在官方start文档（http://hawt.io/getstarted/index.html）中下载hawtio-default.war包，放到任意位置，war包的名字也可以随便改

## 代码
基本的代码，如果不需要其他配置，非常简单
```
            Main main = new Main();
            main.setWar("hawtio.war");
            main.run();
```
使用main.setWar配置的是war包具体路径，可以在工程内，也可以在工程外，但是并非官方文档所说的“包含war包的目录路径(somePathOrDirectoryContainingHawtioWar)”
之后运行main.run就可以启动hawtio了.

## 权限
新版本的hawtio默认是要密码的，如果想简单，可以配置一条jvm参数： -Dhawtio.authenticationEnabled=false， 关掉权限验证。

示例代码可以在github (https://github.com/lcy362/CamelDemo/blob/master/src/main/java/com/mallow/demo/camel/MainWithHawtio.java) 上看，可以直接下载运行，不过需要在本地启动一个activemq. 这里的例子是一个使用hawtio监控apache-camel的简单例子，启动后，在hawtio页面上栏可以直接看到camel的标签，使用非常方便。
---
