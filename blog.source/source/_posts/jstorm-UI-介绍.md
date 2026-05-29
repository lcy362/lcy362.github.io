---
title: jstorm UI 介绍
description: "JStorm UI 功能详解，包括 Cluster Summary、Topology Summary 等监控项的说明和二次开发指南。"
tags:
  - storm
  - jstorm
abbrlink: 31996
date: 2016-11-16 19:58:00
---


# UI说明

jstorm的UI相对于storm提供了更为丰富的监控项。UI本身是在tomcat中运行的一个war包，进行二次开发也相对容易。

## cluster页

### Cluster Summary, Cluster Stats, Topology Summary

cluster的整体信息, conf中是nimbus节点的配置。

### Topology Summary

当前运行的所有topology列表及概要信息，conf中对应的是topology单独配置的配置项。

### Supervisor Summary

所有supervisor列表, 可以查看supervisor的配置、日志等。

## topology页

### Topology Summary

主要关注Topology Graph 项，这是Component Metrics 页的概要信息，可以较直观的看出运行状况。

其中，节点大小和箭头粗细代表数据量，节点颜色用于区分spout和bolt。箭头颜色对应TupleLifeCycle属性，由绿到红越来越慢。箭头变红色时，可以适当增加下游节点的并行度。

### Component Metrics

包含每个spout, bolt的统计信息。

各参数说明:

tasks : 并行度。对应代码中为每个spout/bolt设置的并行度。

emitted, acked, failed : 发射/收到ack/未收到ack的消息数。

sendTps, recvTps: 发送/接收数据tps.

需要注意，以上数据交互类的指标包含了与storm本身组件，topology_master,acker之间的交互，只能用来查看运行状况，**不适合统计用**。

process: 对于bolt来说，是excute()函数的执行时间，对于spout来说，是整条消息（包含下游各步）被完整处理的时间，体现系统运行效率的主要参数。

TupleLifeCycle: 从上游消息被emit,到消息处理完所需时间。和process相比相差太大时，说明在bolt队列中等待了较长时间，可以适当增加并发。

deser, ser: 序列化/反序列化耗时，一般无需关注. storm中每一个emit出来的数据都需要做序列化和反序列化。

error: 鼠标悬浮在E上，可以查看具体的报错信息。**主要寻找带异常堆栈的数据<strong>， 一些诸如is dead, no response之类的信息无需关注。**</strong>

