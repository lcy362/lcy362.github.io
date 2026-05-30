---
title: "Prometheus Tutorial: Everything You Need to Know"
description: "A Prometheus monitoring system tutorial that explains how its simple design supports complex functionality, starting from its design philosophy."
keywords:
  - Prometheus
  - monitoring system
  - cloud native
  - time series database
  - tutorial
categories:
  - cloud native
tags:
  - cloud native
  - monitoring
  - prometheus
  - grafana
  - prometheus tutorial
abbrlink: 28288
date: 2021-11-10 19:54:05
---
As the "default" monitoring system in the cloud-native ecosystem, Prometheus is gaining increasing attention. Today, we'll write a tutorial about Prometheus's design philosophy, examining how it uses very simple designs to support such complex functionality.

<!-- more -->

First, let's think about what the challenges would be in building a monitoring system similar to Prometheus:

- Each service has different monitoring requirements. How should a monitoring system design its data model to balance ease of use and generality?
- How should large volumes of data be stored?
- How can various complex reports be generated?
- ...

With these questions in mind, let's look at how Prometheus is designed.

## History

Let's start with the history. Prometheus was originally developed by SoundCloud and later donated to the open-source community. In 2016, it joined CNCF (Cloud Native Computing Foundation). Prometheus is CNCF's second project, second only to Kubernetes. As you can imagine, Prometheus plays a vital role in the entire cloud-native ecosystem. It has gradually become the de facto standard for monitoring systems in cloud-native environments.

## Core Design Philosophy

For a monitoring system, there are three core problems to solve:

1. How monitoring metrics are represented
2. How to collect and store metrics
3. How to use metrics to generate reports

For these three questions, Prometheus offers very elegant solutions.

## Data Model

Prometheus's data model is, in short, "time-series" metric data. A metric is a measurement of data, and time-series means these metrics continuously generate data points at different time points.

Each metric has a unique name identifier and can have multiple labels set for filtering and aggregation. The format is as follows:

```
<metric name>{<label name>=<label value>, ...}
```

This way, for any business, monitoring data can be designed into a unified metric format. This allows Prometheus to keep its approach simple — it only needs to handle this one data format. At the same time, it is flexible enough to accommodate diverse business scenarios.

Prometheus provides four core metric types: counter, gauge, histogram, and summary. However, their differences only manifest on the client side and in PromQL. As of now (2021.11), different metric types don't differ on the Prometheus server side.

## Data Collection and Storage

The Prometheus server periodically scrapes data from HTTP endpoints exposed by the services being monitored — this is a typical pull model.

Compared to the push model, the pull model has some advantages, such as making it easier to detect whether a specific node is functioning properly, and easier to debug locally. Of course, for a monitoring system, whether to use push or pull is not a fundamental issue.

Prometheus data is typical time-series data. Prometheus itself stores data on local disk. Note that local storage is not replicable and cannot form a cluster. If the local disk or node fails, storage cannot be scaled or migrated. Therefore, local storage should generally be treated only as a short-term sliding window for recent data.

Regarding persistent storage, Prometheus doesn't actually try to solve this problem itself. Instead, it defines standard read/write interfaces, allowing data to be stored on any third-party storage system.

## Generating Reports

Prometheus defines the powerful PromQL language, which can satisfy various complex query scenarios. For details, refer to https://prometheus.io/docs/prometheus/latest/querying/basics/

## Ecosystem

The development of any open-source project depends on the growth of its ecosystem. Prometheus now has a very mature ecosystem. In mainstream programming languages like Java, Go, and Python, there are complete client libraries available. In Spring, you can easily add instrumentation to various components — we'll cover this in detail in the practical section below. In Kubernetes, you can easily configure automatic scraping of Prometheus metrics from each node. With tools like Grafana, you can also configure a wide variety of dashboards and reports.

## Hands-On Practice

In the next part of this tutorial, we'll use a Spring Boot project as an example to see Prometheus in action.

The core idea is to use Spring Actuator to configure monitoring for a Spring Boot application and expose it in Prometheus format.

First, add the dependencies:

```
implementation("org.springframework.boot:spring-boot-starter-actuator")
implementation("io.micrometer:micrometer-registry-prometheus")
```

Then add the Spring configuration:

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

This configuration does several things: exposes data in Prometheus format, automatically adds histogram monitoring for HTTP requests, and adds an `application` identifier that appears as a label in all metrics.

After starting the Spring Boot project and visiting the `/actuator/prometheus` path, you'll see a large number of metrics, such as:

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

In addition to the explicitly configured HTTP monitoring, there is also a large amount of basic monitoring information such as JVM metrics and machine load.

Beyond that, monitoring for other components is also easy to add, such as thread pools, HTTP connection pools, and custom metrics. You can refer to https://github.com/lcy362/springboot-prometheus-demo

This way, regardless of how the Spring Boot project is deployed — whether using native Java deployment, Docker deployment, or deployment on Kubernetes — it's very easy to obtain all the monitoring metrics data.

Original article: http://lichuanyang.top/posts/28288/

---

Source: https://lichuanyang.top/en/posts/28288/
