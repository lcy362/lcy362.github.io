---
title: '五分钟学会写storm代码: jstorm/storm编码原理与普通java程序的区别'
description: "Storm/JStorm 编程快速入门，重点说明 topology 运行时与传统 Java 程序在初始化上的关键区别。"
tags:
  - storm
abbrlink: 27021
date: 2016-11-16 18:21:00
---


### 运行机制

topology里spout/bolt的整体结构不再细讲，主要说说storm/jstorm topology运行时与传统java程序可能存在的区别。其实区别非常少，主要也体现在初始化上，本文的目的在于帮助开发人员在无需了解storm内核原理的情况下，排查topology程序可能出现的问题。

1个topology会包含多个spout线程和bolt线程，分散运行在数个worker（进程）中。同一个worker中可能同时运行多个bolt/spout的数个线程。

### 与普通java程序的区别

#### main方法

main方法只在启动时运行在nimbus中，因此除了storm本身的配置项外，其他程序相关的配置，如spring配置等，配置在main方法中**不会起作用<strong>。**</strong>

#### bolt

bolt 的主体结构包含prepare, excute, cleanup 三部分。

其中，prepare在初始化时执行一次，cleanup在退出前执行一次，excute每条消息执行。 

一些配置，**包括加密，spring加载等，建议都放到prepare中<strong>。多个bolt都需要加载spring时，建议使用同样的配置，避免一些诡异问题。**</strong>

#### 序列化

所有**静态代码块**中作了初始化的变量，emit的变量，由于都存在网络传输，需要能够被序列化。

storm默认使用kyro序列化，需要类有无参构造函数。如果无法增加无参构造函数，设置topology.fall.back.on.java.serialization: true使用java自带的序列化。

