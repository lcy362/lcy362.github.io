---
title: 'Storm/JStorm Ecosystem and Peripheral Tools: Connecting Storm to ActiveMQ, Kafka, HDFS and More'
description: "A panoramic view of Storm/JStorm ecosystem tools, introducing how to connect ActiveMQ, Kafka, HDFS and other external systems to build complete data pipelines."
keywords:
  - Storm
  - JStorm
  - Kafka
  - ActiveMQ
  - HDFS
  - data pipeline
categories:
  - Big Data
tags:
  - storm
  - jstorm
  - kafka
  - activemq
abbrlink: 22103
tldr: "Introduces the toolkit for integrating Storm/JStorm with external systems such as ActiveMQ, Kafka, and HDFS, enabling complete big data real-time processing pipelines."
cover: /img/22103.jpg
date: 2016-11-16 20:16:00
---
Storm has a very rich surrounding ecosystem. There are ready-made toolkits available for interacting with Kafka, ActiveMQ, HDFS, HBase, and others. Most of these tools, including those introduced today, can also be used normally in JStorm.

## storm-jms
Implements interaction with JMS implementations such as ActiveMQ.

Here we mainly introduce JmsSpout. Since sending queue data in Storm is no different from regular Java programs, wrapping it in a dedicated bolt seems unnecessary.

https://github.com/ptgoetz/storm-jms

The package includes Spring-based queue configuration loading.

## Usage Example
```java
        JmsProvider jmsQueueProvider = new SpringJmsProvider(
                "jms-activemq.xml", "jmsConnectionFactory",
                "TEST_QUEUE");
        JmsTupleProducer producer = new JsonTupleProducer();

        // JMS Queue Spout
        JmsSpout queueSpout = new JmsSpout();
        queueSpout.setJmsProvider(jmsQueueProvider);
        queueSpout.setJmsTupleProducer(producer);
        queueSpout.setJmsAcknowledgeMode(Session.CLIENT_ACKNOWLEDGE);
        queueSpout.setDistributed(true);
        TopologyBuilder builder = new TopologyBuilder();

        builder.setSpout("jms", queueSpout, 30);
```

## Configuration File Example
```xml
<?xml version="1.0"?>
<!--
 Licensed to the Apache Software Foundation (ASF) under one or more
 contributor license agreements.  See the NOTICE file distributed with
 this work for additional information regarding copyright ownership.
 The ASF licenses this file to You under the Apache License, Version 2.0
 (the "License"); you may not use this file except in compliance with
 the License.  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-->
<beans 
  xmlns="http://www.springframework.org/schema/beans" 
  xmlns:amq="http://activemq.apache.org/schema/core"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-2.0.xsd
  http://activemq.apache.org/schema/core http://activemq.apache.org/schema/core/activemq-core.xsd">

	<amq:queue id="detrUpdateQueue" physicalName="TEST_QUEUE" />

	<amq:connectionFactory id="jmsConnectionFactory"
		brokerURL="failover:(tcp://xxx:61616)?jms.prefetchPolicy.queuePrefetch=10" />

</beans>
```

## Usage Instructions

Create a new XML configuration file. The `<amq:queue>` element configures the queue name.

The `<amq:connectionFactory>` element configures the ActiveMQ connection URL.

Call in code:
```java
JmsProvider jmsQueueProvider = new SpringJmsProvider(
                "jms-activemq.xml", "jmsConnectionFactory",
                "TEST_QUEUE");
```
The three parameters are, in order: the configuration file name, the connectionFactory element name, and the queue element name.

## Custom Output
Personalized output can be achieved by implementing JmsTupleProducer.

Taking JsonTupleProducer as an example:
```java
public class JsonTupleProducer implements JmsTupleProducer {

	@Override
	public Values toTuple(Message msg) throws JMSException {
		if(msg instanceof TextMessage){
			String json = ((TextMessage) msg).getText();
			return new Values(json);
		} else {
			return null;
		}
	}

	@Override
	public void declareOutputFields(OutputFieldsDeclarer declarer) {
		declarer.declare(new Fields("json"));
	}

}
```
This emits the entire message as a single field.

declareOutputFields and new Values are the corresponding functions in Storm.

By processing appropriately in toTuple, customized output can be achieved.

### Disabling Ack
Besides setting the ack count to 0 via `conf.setNumAckers(0);`

you also need to change the JMS acknowledgment mode to auto-ack:

```java
queueSpout.setJmsAcknowledgeMode(Session.AUTO_ACKNOWLEDGE);
```

### Custom JMS Connector
The JmsProvider class is used by JmsSpout to establish connections to queues.

The default SpringJmsProvider obtains JMS connections through Spring configuration.

If there are special requirements, you can implement the two interfaces in JmsProvider yourself to obtain the ConnectionFactory and queue Destination.

## storm-kafka
https://github.com/apache/storm/tree/master/external/storm-kafka

Retrieving data from Kafka.

## Usage Example
```java
        String topic = ""; //queue name
        String zkRoot = "/kafkastorm"; //root directory where Kafka records offsets in ZooKeeper, no need to change
        String id = ""; // consumer id
        String kafkaZk = ""; //Kafka's ZooKeeper address
        BrokerHosts brokerHosts = new ZkHosts(kafkaZk);
        SpoutConfig kafkaConfig = new SpoutConfig(brokerHosts, topic, zkRoot, id);
        kafkaConfig.scheme = new SchemeAsMultiScheme(new StringScheme());
        kafkaConfig.ignoreZkOffsets = true; //when false, use offset information stored in Kafka
        kafkaConfig.startOffsetTime = kafka.api.OffsetRequest.LatestTime(); //starting position for reading data, only effective when ignoreZkOffsets is set to true
        kafkaConfig.zkServers = new ArrayList<String>(){ {
            add("1"); //ZooKeeper node storing Kafka offsets
        } };
        kafkaConfig.zkPort = 2181;
        TopologyBuilder builder = new TopologyBuilder();
        builder.setSpout(topic, new KafkaSpout(kafkaConfig), 10); //parallelism cannot exceed the number of Kafka partitions
        builder.setBolt....
```

## storm-hdfs
HdfsBolt supports writing data to HDFS.
## Usage Example
```java
        SyncPolicy syncPolicy = new CountSyncPolicy(100); //sync to disk every 100 records
        DailyRotationPolicy rotationPolicy = new DailyRotationPolicy(); //archive files daily

        FileFolderByDateNameFormat fileNameFormat = new FileFolderByDateNameFormat()
                .withPath("/user/lcy/jdata"); //HDFS path
        RecordFormat format = new DelimitedRecordFormat()
                .withFieldDelimiter(","); //delimiter between fields

        UmeHdfsBolt hdfsbolt = new UmeHdfsBolt()
                .withFsUrl("hdfs://:8020") //HDFS URL
                .withFileNameFormat(fileNameFormat)
                .withRecordFormat(format)
                .withRotationPolicy(rotationPolicy)
                .withSyncPolicy(syncPolicy);
```
## Example Description
When coded according to the example, the output to HDFS is as follows:

Each record received by the bolt becomes one line in HDFS;

The output path to HDFS is: configured path / date / default filename;

Each thread of hdfsbolt outputs to a separate file; topology restarts create new files;

Files are archived daily.

## Additional Features
FileSizeRotationPolicy supports archiving by fixed file size; TimedRotationPolicy supports archiving by fixed time;

If other archiving methods are needed, you can implement the FileRotationPolicy interface, referring to DailyRotationPolicy source code.

Custom file paths and filenames can be implemented through the FileNameFormat interface, referring to FileFolderByDateNameFormat.

## FileFolderByDateNameFormat
FileFolderByDateNameFormat implements the commonly used storage path pattern.
Usage example:
```java
       FileFolderByDateNameFormat fileNameFormat = new FileFolderByDateNameFormat()
                .withPath("/user/test").withName("");
```
This will automatically append a date after the path, and dates will also be included in the filename.

## Source Reference
In addition to the storm-hdfs source code itself, you can refer to https://github.com/lcy362/StormTrooper for the implementations of FileFolderByDateNameFormat and DailyRotationPolicy.

---

Source: https://lichuanyang.top/en/posts/22103/
