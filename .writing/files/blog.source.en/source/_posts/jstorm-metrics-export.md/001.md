---
title: Exporting JStorm Monitoring Metrics to Third-Party Storage
description: "A solution for exporting JStorm monitoring metrics data to third-party storage for convenient historical data querying and analysis."
keywords:
  - JStorm
  - monitoring
  - metrics
  - data storage
  - operations
categories:
  - Big Data
tags:
  - storm
  - jstorm
  - monitoring
abbrlink: 13749
cover: /img/storm-metrics.jpg
date: 2017-09-06 20:18:00
---
JStorm's UI provides a large number of very detailed monitoring parameters, which are extremely helpful for troubleshooting. For information about the UI, you can refer to my previous article: https://lichuanyang.top/posts/31996/. However, using the UI can sometimes be inconvenient, for example when you need to query historical data. Therefore, we want to export monitoring data to other storage media for easier subsequent querying and analysis.

Since JStorm's monitoring has been completely rewritten compared to Apache Storm, the monitoring export methods found online for Storm are not applicable to JStorm. And apart from the official documentation, JStorm lacks resources. The official documentation is too brief, providing only some hints, and you need to combine these hints with source code to understand the details. So I've put together an example of exporting JStorm monitoring data.

First, you need to implement the MetricUploader interface. However, we don't actually use any of the methods in this interface. The main purpose is to use its TopologyMetricsRunnable parameter, and then use this parameter to retrieve monitoring information. So theoretically, as long as you obtain TopologyMetricsRunnable, you don't necessarily have to implement the MetricUploader interface. My approach is to implement MetricUploader, and then start a scheduled thread pool to periodically fetch monitoring data.

JStorm's metric data is stored in RocksDB. The data retrieved here is essentially querying RocksDB using JStorm's wrapped interfaces.

The specific code is as follows:
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
The entire flow is quite clear. First, query the list of topologies in the cluster, then use each topology ID to query metric information, obtaining a TopologyMetric object. TopologyMetric contains topologyMetric, componentMetric, workerMetric, and other attributes, which correspond to the respective pages in the UI.

Taking componentMetric as an example, you can use componentMetric.get_metrics() to get the specific monitoring metric data. A metric is a `Map<String, Map<Integer, MetricSnapshot>>`, where the key is a string separated by '@' characters, containing key information such as topology name, component name, and data item. The value of this map is a time (in seconds), corresponding to the 1-minute, 2-minute pages on the UI, and the value is the specific monitoring data. This data is actually richer than what the UI displays — besides averages, it also includes the 95th percentile, 99th percentile, etc.

In this example, I only output some of the data using logging. In practice, you can use storage media such as HBase, Redis, MySQL, etc. according to your needs.

The specific code can be viewed at https://github.com/lcy362/StormTrooper/blob/master/src/main/java/com/trooper/storm/monitor/MetricUploaderTest.java

---

Source: https://lichuanyang.top/en/posts/13749/
