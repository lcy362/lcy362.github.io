---
title: prometheus教程： 一篇文章讲懂prometheus
description: "Prometheus 监控系统教程，从设计理念出发讲清楚它如何用简单设计支撑复杂功能。"
keywords:
  - Prometheus
  - 监控系统
  - 云原生
  - 时序数据库
  - 教程
categories:
  - 云原生
tags:
  - 云原生
  - 监控
  - prometheus
  - grafana
  - prometheus教程
abbrlink: 28288
date: 2021-11-10 19:54:05
---
作为云原生体系下的“默认”监控系统，prometheus正在获得越来越广泛的关注。今天，我们就写一篇教程，讲一下prometheus的设计理念，看看它是如何用非常简单的设计支撑起如此复杂的功能的。

<!-- more -->

首先，我们来思考一下，如果要做一个类似prometheus的监控系统，都有哪些难点，比如

- 每个服务的监控需求都不一样，那么对于监控系统来说，要怎么设计其数据模型，才能取得易用性和通用性之间的平衡
- 大量的数据量要如何存储
- 怎样能实现各种复杂的报表
- ...

带着这些问题，我们就来看看prometheus是怎么设计的。

## 历史

让我们先从历史说起，prometheus最早由SoundCloud开发，后来捐赠到开源社区。在2016年假如CNCF, 即云原生计算基金会。Prometheus是CNCF的第二个项目，仅次于kubernets。 因此，可想而知，promethous在整个云原生体系中有多么重要的作用。Prometheus也逐渐成了云原生下监控系统的事实标准。

## 核心设计理念

对于一个监控系统来说，核心要解决的问题其实就三个：

1. 监控指标用什么形式表示
2. 怎么收集和存储指标
3. 怎么利用指标生成报表

对于这三个问题，prometheus都给出了很巧妙的解决方案。

## 数据模型

romethous的数据模型，简而言之，就是一个「时序」的 Metric数据。所谓metric, 就是数据的测量值，而所谓时序，就是这些metric, 会源源不断的产生不同时间点的数据。

Metric有唯一的名称标识，也可以设置多个label, 可以用于过滤和聚合，其格式如下。

```
<metric name>{<label name>=<label value>, ...}
```

这样，对于任何业务，我们都可以将监控数据设计成统一的metric格式。这样对于promethous来说，方案可以足够简单，只用处理这一种数据格式就可以。而同时又足以方便的应对千变万化的业务场景。

Prometheus提供了 counter, gauge, histogram, summary 四种核心的metric, 不过其区别仅体现在client端和promQL中。截至目前(2021.11)， 不同的metric 类型在 prometheus server 这一侧并不会有什么区别，

## 数据收集和存储

Prometheus server会定时从要监控的服务暴露出的http接口上抓取数据，是一种典型的拉模型。

相对推模型，拉模型会有一些好处，比如更容易监测某一个节点是否正常；更容易本地调试等。当然，对于一个监控系统来说，采用推还是拉，其实并不是一个主要问题。

Prometheus的数据是典型的时序数据，prometheus本身会将数据存储在本地磁盘上。要注意的是，本地存储不可复制，无法构建集群，如果本地磁盘或节点出现故障，存储将无法扩展和迁移。因此一般只能把本地存储视为近期数据的短暂滑动窗口。

而关于持久化存储的问题，prometheus实际上并没有试图解决。它的做法是定义出标准的读写接口，从而可以将数据存储到任意一个第三方存储上。

## 生成报表

Prometheus定义了功能强大的promQL, 可以满足各种复杂的查询场景，具体可参考 https://prometheus.io/docs/prometheus/latest/querying/basics/

## 周边生态

一个开源项目的发展，当然离不开周边生态的发展。而prometheus目前已经有了很完善的生态，在java, go, python等主流的开发语言下，都有完善的client包可以使用； 像spring中，可以很容易的为多种组件增加打点，这一点，在下边的实战环节我们会细讲；在kubernetes中，可以轻易的配置自动去各个节点抓取prometheus数据；借助grafana等工具，也可以配置出多种多样的报表。

## 实战

教程的接下来一部分，我们会以springboot项目为例，来看一看prometheus的实际效果。

其核心思路就是使用spring-actuator 为springboot应用配置监控，并以promethous的结构暴露出来。

首先，引入依赖

```
implementation("org.springframework.boot:spring-boot-starter-actuator")
implementation("io.micrometer:micrometer-registry-prometheus")
```

然后添加spring配置

```
management:
  endpoints:
    web:
      exposure:
        include: "prometheus"
  metrics:
    distribution:
      sla:
        http:
          server:
            requests: "100ms,150ms,250ms,500ms,1s"
      percentiles-histogram:
        http:
          server:
            requests: true
    web:
      server:
        request:
          autotime:
            enabled: true
    export:
      prometheus:
        enabled: true
    tags:
      application: name
```

这个配置里，其实做了几件事：将数据以prometheus的格式暴露出来；自动为http请求添加histogram监控；增加一个application标识，这个标识会作为一个label出现在所有metric中。

之后，启动springboot项目，并且访问/actuator/prometheus路径，就可以看到大量metric, 比如

```
# HELP executor_pool_size_threads The current number of threads in the pool
# TYPE executor_pool_size_threads gauge
executor_pool_size_threads{application="ads-programad",name="asyncExecutor",} 0.0
# HELP tomcat_servlet_request_seconds  
# TYPE tomcat_servlet_request_seconds summary
tomcat_servlet_request_seconds_count{application="ads-programad",name="dispatcherServlet",} 1.0
tomcat_servlet_request_seconds_sum{application="ads-programad",name="dispatcherServlet",} 0.0
# HELP executor_pool_core_threads The core number of threads for the pool
# TYPE executor_pool_core_threads gauge
executor_pool_core_threads{application="ads-programad",name="asyncExecutor",} 70.0
# HELP jvm_classes_unloaded_classes_total The total number of classes unloaded since the Java virtual machine has started execution
# TYPE jvm_classes_unloaded_classes_total counter
jvm_classes_unloaded_classes_total{application="ads-programad",} 0.0
# HELP executor_completed_tasks_total The approximate total number of tasks that have completed execution
# TYPE executor_completed_tasks_total counter
executor_completed_tasks_total{application="ads-programad",name="asyncExecutor",} 0.0
# HELP tomcat_threads_config_max_threads  
# TYPE tomcat_threads_config_max_threads gauge
tomcat_threads_config_max_threads{application="ads-programad",name="http-nio-9000",} 500.0
# HELP process_cpu_usage The "recent cpu usage" for the Java Virtual Machine process
# TYPE process_cpu_usage gauge
process_cpu_usage{application="ads-programad",} 0.0
# HELP tomcat_sessions_active_current_sessions  
# TYPE tomcat_sessions_active_current_sessions gauge
tomcat_sessions_active_current_sessions{application="ads-programad",} 0.0
# HELP jvm_memory_committed_bytes The amount of memory in bytes that is committed for the Java virtual machine to use
# TYPE jvm_memory_committed_bytes gauge
jvm_memory_committed_bytes{application="ads-programad",area="heap",id="G1 Eden Space",} 3.5651584E7
jvm_memory_committed_bytes{application="ads-programad",area="heap",id="G1 Old Gen",} 4.6137344E7
jvm_memory_committed_bytes{application="ads-programad",area="nonheap",id="Compressed Class Space",} 5767168.0
jvm_memory_committed_bytes{application="ads-programad",area="nonheap",id="CodeHeap 'non-profiled nmethods'",} 8847360.0
jvm_memory_committed_bytes{application="ads-programad",area="nonheap",id="CodeHeap 'non-nmethods'",} 2555904.0
jvm_memory_committed_bytes{application="ads-programad",area="nonheap",id="Metaspace",} 4.2287104E7
jvm_memory_committed_bytes{application="ads-programad",area="heap",id="G1 Survivor Space",} 4194304.0
# HELP tomcat_servlet_request_max_seconds  
# TYPE tomcat_servlet_request_max_seconds gauge
tomcat_servlet_request_max_seconds{application="ads-programad",name="dispatcherServlet",} 0.0
# HELP tomcat_connections_current_connections  
# TYPE tomcat_connections_current_connections gauge
tomcat_connections_current_connections{application="ads-programad",name="http-nio-9000",} 3.0
# HELP tomcat_sessions_active_max_sessions  
# TYPE tomcat_sessions_active_max_sessions gauge
...
```

其中，除了我们显式配置的http监控，其实还有大量的jvm, 机器负载等基础的监控信息。

除此之外，对于其他组件的监控也很容易添加，诸如线程池、http连接池、自定义监控等，可以参考 https://github.com/lcy362/springboot-prometheus-demo

这样，无论这个springboot项目如何部署，无论是用java原生的部署，还是用docker部署，还是部署在kubernetes上，都可以非常容易的获取各个监控metrics数据。

原文地址: https://lichuanyang.top/posts/28288/

---
