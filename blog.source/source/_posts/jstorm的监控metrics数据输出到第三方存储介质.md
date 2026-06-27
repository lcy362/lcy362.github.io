---
title: jstorm的监控metrics数据输出到第三方存储介质
description: "将 JStorm 监控 metrics 数据输出到第三方存储介质的方案，方便历史数据查询和分析。"
keywords:
  - JStorm
  - 监控
  - metrics
  - 数据存储
  - 运维
categories:
  - 大数据
tags:
  - storm
  - jstorm
  - 监控
abbrlink: 13749
cover: /img/storm-metrics.jpg
tldr: 把JStorm监控数据输出到外部存储，配合Grafana实现可视化监控
date: 2017-09-06 20:18:00
howto:
  - 实现MetricUploader接口：创建类实现MetricUploader，获取TopologyMetricsRunnable对象
  - 配置metrics：在jstorm配置中指定自定义的MetricUploader实现类
  - 测试验证：运行拓扑，检查metrics数据是否正确上报到目标存储
  - 对接Grafana：将存储介质接入Grafana数据源，创建监控面板
---
## JStorm Metrics 体系

Jstorm的UI中提供了大量非常详细的监控参数，对于我们排查问题帮助非常大，关于UI，可以参考我之前的另一篇文章： https://lichuanyang.top/posts/31996/ 。 不过，UI这种方式用起来有时可能会不太方便，比如需要查历史数据的时候。所以我们希望将监控数据输出到别的存储介质中，方便后续查询、分析。

由于jstorm的监控相比于apache-storm进行了完全的重写，所以网上查到的storm的监控输出方式并不适用于jstorm. 而jstorm除了官方文档以外实在缺少资料，官方文档又太简略，给的只是一些线索性的东西，具体还要结合这些线索去翻阅源码。所以我整理了一个jstorm监控数据输出的例子。

## 自定义 Metrics 上报

首先需要实现MetricUploader这个接口，不过其实我们并不会实际使用这个接口里的哪个方法，主要是要去用它的TopologyMetricsRunnable这个参数，然后用这个参数去取监控信息。所以理论上只要拿到TopologyMetricsRunnable就行，并不一定非要实现MetricUploader接口。我的做法是实现MetricUploader，然后自己起一个定时的线程池，定时去取监控数据。

jstorm的metric数据存在rocksdb里，这里取的数据实质上是用jstorm封装好的接口去查询rocksdb。

## 核心代码实现

具体代码如下:
```java
                    ClusterSummary clusterInfo = client.getClient().getClusterInfo();
                    //get list of topologies in this cluster
                    List<TopologySummary> topologies = clusterInfo.get_topologies();
                    for (TopologySummary topology : topologies) {
                        //get topology id and name
                        //the id is used for query, name for human reading
                        logger.info("topology info " + topology.get_id() + " " + topology.get_name());
                        TopologyMetric metric = metricsRunnable.getTopologyMetric(topology.get_id());
                        //get data of "component metrics" page in jstorm UI
                        MetricInfo componentMetric = metric.get_componentMetric();
                        Map<String, Map<Integer, MetricSnapshot>> metrics = componentMetric.get_metrics();
                        for (Map.Entry<String, Map<Integer, MetricSnapshot>> oneMetric : metrics.entrySet()) {
                            String[] key = oneMetric.getKey().split("@");
                            String metricKey = key[1] + "@" + key[2] + "@" + key[6];
                            //get(60) to get data in 1 min, also can get(600) for 10min, and so on
                            logger.info("metric one minute data for " + metricKey + " " + oneMetric.getValue().get(60));
                        }
                    }
```
## 数据解析与输出

整个流程比较清晰，首先需要去查询集群中topology的列表，然后使用每一个topology id去查询metric信息，得到一个TopologyMetric类， TopologyMetric里包含topologyMetric，componentMetric，workerMetric等属性，这个分别与UI页面里对应。

以componentMetric为例， 可以使用componentMetric.get_metrics(); 拿到具体的监控metric数据, 一个metric是一个Map<String, Map<Integer, MetricSnapshot>>， 其中key是一个@符分隔的字符串，里边包含topology名,component名，数据项等关键的key信息，value里这个map的key是一个时间，单位为秒，对应UI上1分钟，2分钟那几页，value就是具体的监控数据，这个数据其实比UI展示出来的更丰富，除了均值外，还有诸如95线，99线等。

在这个例子里，我只是用打日志的方式，将部分数据输出。具体用的时候，可以根据需求使用hbase, redis,mysql等存储介质。

具体代码可以查看 https://github.com/lcy362/StormTrooper/blob/master/src/main/java/com/trooper/storm/monitor/MetricUploaderTest.java

## 快速上手步骤

1. **实现 MetricUploader 接口**：创建自定义类实现 `MetricUploader` 接口，通过构造函数获取 `TopologyMetricsRunnable` 对象，用它来查询 RocksDB 中的 metrics 数据。
2. **编写 metrics 采集逻辑**：调用 `metricsRunnable.getTopologyMetric(topologyId)` 获取 `TopologyMetric`，分别读取 `componentMetric`、`workerMetric`、`topologyMetric` 等维度的数据，解析 `@` 分隔的 metric key 并存储。
3. **配置 JStorm**：在 JStorm 配置文件中将自定义的 MetricUploader 实现类注册进去，确保拓扑启动后自动启用 metrics 上报。
4. **测试验证**：启动拓扑，检查目标存储介质（HBase/Redis/MySQL 等）中是否有 metrics 数据写入，对照 JStorm UI 确认数据一致性。
5. **对接 Grafana**：将存储介质配置为 Grafana 数据源，编写查询语句创建监控面板，实现历史数据的可视化查询和告警。
