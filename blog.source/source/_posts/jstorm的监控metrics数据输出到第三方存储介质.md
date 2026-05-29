---
title: jstorm的监控metrics数据输出到第三方存储介质
description: "将 JStorm 监控 metrics 数据输出到第三方存储介质的方案，方便历史数据查询和分析。"
tags:
  - storm
  - jstorm
  - 监控
abbrlink: 13749
date: 2017-09-06 20:18:00
---

Jstorm的UI中提供了大量非常详细的监控参数，对于我们排查问题帮助非常大，关于UI，可以参考我之前的另一篇文章： https://lcy362.github.io/posts/31996/ 。 不过，UI这种方式用起来有时可能会不太方便，比如需要查历史数据的时候。所以我们希望将监控数据输出到别的存储介质中，方便后续查询、分析。

由于jstorm的监控相比于apache-storm进行了完全的重写，所以网上查到的storm的监控输出方式并不适用于jstorm. 而jstorm除了官方文档以外实在缺少资料，官方文档又太简略，给的只是一些线索性的东西，具体还要结合这些线索去翻阅源码。所以我整理了一个jstorm监控数据输出的例子。

首先需要实现MetricUploader这个接口，不过其实我们并不会实际使用这个接口里的哪个方法，主要是要去用它的TopologyMetricsRunnable这个参数，然后用这个参数去取监控信息。所以理论上只要拿到TopologyMetricsRunnable就行，并不一定非要实现MetricUploader接口。我的做法是实现MetricUploader，然后自己起一个定时的线程池，定时去取监控数据。

jstorm的metric数据存在rocksdb里，这里取的数据实质上是用jstorm封装好的接口去查询rocksdb。

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
整个流程比较清晰，首先需要去查询集群中topology的列表，然后使用每一个topology id去查询metric信息，得到一个TopologyMetric类， TopologyMetric里包含topologyMetric，componentMetric，workerMetric等属性，这个分别与UI页面里对应。

以componentMetric为例， 可以使用componentMetric.get_metrics(); 拿到具体的监控metric数据, 一个metric是一个Map<String, Map<Integer, MetricSnapshot>>， 其中key是一个@符分隔的字符串，里边包含topology名,component名，数据项等关键的key信息，value里这个map的key是一个时间，单位为秒，对应UI上1分钟，2分钟那几页，value就是具体的监控数据，这个数据其实比UI展示出来的更丰富，除了均值外，还有诸如95线，99线等。

在这个例子里，我只是用打日志的方式，将部分数据输出。具体用的时候，可以根据需求使用hbase, redis,mysql等存储介质。

具体代码可以查看 https://github.com/lcy362/StormTrooper/blob/master/src/main/java/com/trooper/storm/monitor/MetricUploaderTest.java