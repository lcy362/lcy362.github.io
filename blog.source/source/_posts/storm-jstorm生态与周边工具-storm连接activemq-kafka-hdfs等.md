---
title: 'storm/jstorm生态与周边工具,storm连接activemq,kafka,hdfs等'
description: "Storm/JStorm 生态工具全景，介绍如何连接 ActiveMQ、Kafka、HDFS 等外部系统构建完整数据管道。"
keywords:
  - Storm
  - JStorm
  - Kafka
  - ActiveMQ
  - HDFS
  - 数据管道
categories:
  - 大数据
tags:
  - storm
  - jstorm
  - kafka
  - activemq
abbrlink: 22103
date: 2016-11-16 20:16:00
---
storm的周边生态非常丰富，与kafka,activemq,hdfs,hbase等的交互都有现成的工具包可以使用。大部分工具，包括今天介绍的这几个，在jstorm中也可以完全正常的使用。

## storm-jms
实现了与activemq等jms实现的交互。

这里主要介绍JmsSpout。由于storm中发送队列数据与普通java程序没有任何区别，专门封装一个bolt显得有些多此一举。

https://github.com/ptgoetz/storm-jms

包中自带了使用spring方式加载队列配置。

## 使用示例
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

## 配置文件示例
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

## 使用说明

新建一个xml配置，<amq:queue> 节点配置队列名。

<amq:connectionFactory>节点配置activemq的连接url。

代码中调用
```java
JmsProvider jmsQueueProvider = new SpringJmsProvider(
                "jms-activemq.xml", "jmsConnectionFactory",
                "TEST_QUEUE");
```
三个参数依次为配置文件名, connectionFactory和queue节点的名称。

## 自定义输出
通过实现JmsTupleProducer可以实现个性化的输出。

以JsonTupleProducer 为例:
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
即将整条消息作为一个字段emit出去。

declareOutputFields和new Values 即storm中的对应函数。

通过在toTuple中做相应处理，可以实现定制化的输出。

### 关闭ack
除了将ack数设为0外，conf.setNumAckers(0);

还需要将jms的确认模式修改为自动ack:

```java
queueSpout.setJmsAcknowledgeMode(Session.AUTO_ACKNOWLEDGE);
```

### 自定义jms连接器
JmsProvider类是JmsSpout中用于建立到队列的连接所用的类。

默认的SpringJmsProvider是通过spring配置来获取jms连接。

如果有特殊需求，也可以自己实现JmsProvider中的两个接口，用于获取连接ConnectionFactory和队列Destination

## storm-kafka
https://github.com/apache/storm/tree/master/external/storm-kafka

从kafka中获取数据。

## 使用示例

```java
        String topic = ""; //队列名
        String zkRoot = "/kafkastorm"; //kafka在zookeeper中记录offset的根目录，无需改变
        String id = ""; // consumer id
        String kafkaZk = ""; //kafka的zookeeper地址
        BrokerHosts brokerHosts = new ZkHosts(kafkaZk);
        SpoutConfig kafkaConfig = new SpoutConfig(brokerHosts, topic, zkRoot, id);
        kafkaConfig.scheme = new SchemeAsMultiScheme(new StringScheme());
        kafkaConfig.ignoreZkOffsets = true; //false时使用kafka中存储的offset信息
        kafkaConfig.startOffsetTime = kafka.api.OffsetRequest.LatestTime(); //读取数据开始位置,只有ignoreZkOffsets设为true时startOffsetTime才能生效
        kafkaConfig.zkServers = new ArrayList<String>(){ {
            add("1"); //存储kafkaoffset的zookeeper节点
        } };
        kafkaConfig.zkPort = 2181;
        TopologyBuilder builder = new TopologyBuilder();
        builder.setSpout(topic, new KafkaSpout(kafkaConfig), 10); //并行度不能高于kafka分区数
        builder.setBolt....
```

## storm-hdfs
    HdfsBolt支持向hdfs写入数据
## 使用示例
```java
        SyncPolicy syncPolicy = new CountSyncPolicy(100); //每100条hdfs同步一次磁盘
        DailyRotationPolicy rotationPolicy = new DailyRotationPolicy(); //文件每天归档

        FileFolderByDateNameFormat fileNameFormat = new FileFolderByDateNameFormat()
                .withPath("/user/lcy/jdata"); //hdfs路径
        RecordFormat format = new DelimitedRecordFormat()
                .withFieldDelimiter(","); //不同field之间的分隔符

        UmeHdfsBolt hdfsbolt = new UmeHdfsBolt()
                .withFsUrl("hdfs://:8020") //hdfs url
                .withFileNameFormat(fileNameFormat)
                .withRecordFormat(format)
                .withRotationPolicy(rotationPolicy)
                .withSyncPolicy(syncPolicy);
```
## 示例说明
按照示例编码，输出到hdfs形式如下：

bolt接收到的每条数据为hdfs中的一行；

输出到hdfs路径为 设定的路径/日期/默认文件名；

hdfsbolt的每个线程会输出到一个文件，topology重启会产生新文件；

文件每天归档

## 其他功能
FileSizeRotationPolicy 支持按固定文件大小归档；TimedRotationPolicy支持按固定时间归档；

如有其他归档方式需求，可以实现FileRotationPolicy接口，参考DailyRotationPolicy源码。

通过实现FileNameFormat接口自定义文件路径及文件名，参考FileFolderByDateNameFormat

## FileFolderByDateNameFormat
FileFolderByDateNameFormat实现目前常用的存储路径。
使用示例
```java
       FileFolderByDateNameFormat fileNameFormat = new FileFolderByDateNameFormat()
                .withPath("/user/test").withName("");
```
会自动在路径之后增加日期，文件名中也会增加日期。

## 源码参考
除了storm-hdfs本身源码以外，可以参考https://github.com/lcy362/StormTrooper 查看FileFolderByDateNameFormat和DailyRotationPolicy的实现。

---
