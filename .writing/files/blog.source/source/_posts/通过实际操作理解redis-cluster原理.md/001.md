---


title: 通过实际操作理解redis cluster原理
description: "通过实际操作理解 Redis Cluster 的数据分片机制、16384 个哈希槽的设计和节点路由原理。"
keywords:
  - Redis
  - Cluster
  - 哈希槽
  - 数据分片
  - 集群原理
tags:
  - redis
  - redis-cluster
categories:
  - redis系列
abbrlink: 9329
date: 2017-04-14 20:02:00
top_img: /img/redis-cluster.jpg
cover: /img/redis-cluster.jpg


---




Redis 集群是redis官方提供的一种集群方案，从3.0开始提供稳定版，应用也已经比较广泛，也经受住了时间考验，个人感觉完全可以取代codis,tweemproxy等集群方案。

## cluster原理介绍
cluster是使用数据分片的形式实现的，一个 Redis cluster集群包含 16384 个哈希槽, 任意一个key都可以通过 CRC16(key) % 16384 这个公式计算出应当属于哪个槽。每个槽应当落在哪个节点上，也是事先定好。这样，进行任一操作时，首先会根据key计算出对应的节点，然后操作相应的节点就可以了。

所以说，其实cluster跟单点相比，只是多了一个给key计算sharding值的过程，并没有增加多少复杂度，完全可以放心使用。

在这样的设计下，一些对节点的操作也很方便，操作过程中对client端也不会有影响。
1\. 增加节点：将原有节点的某些slot转移到新节点上
2\. 删除节点: 将节点上的槽转移到其他节点上以后，移除空节点
3\. 节点故障：落到故障节点上的操作会失败，而集群其他部分可以正常访问，这样就不会出现一致性哈希方案的“雪崩”问题。单点的故障也可以通过配置slave解决，节点故障时可以由对应的slave顶替
4\. 节点重启: 正常重启即可，节点会自动读之前的配置然后加入集群中。

## 安装操作流程
然后，我们可以实际安装一次，由于只是测试，装个两三个节点就可以，而如果是生产使用的话，至少需要3个master节点，也推荐同时至少有3个slave节点才能使用。

### 安装redis
到redis官网(https://redis.io/download)上下载最新的stable版本。

以3.2.8为例，下载完以后执行以下命令
```
$ tar xzf redis-3.2.8.tar.gz
$ cd redis-3.2.8
$ make
```
然后解压缩，make就可以了.

### redis配置与启动
make之后会在redis的src目录下多出几个命令，包括redis-server, redis-cli等，可以把他们拷到/usr/local/bin下，这样就可以在任意路径下执行。也可以自己指到src目录下进行操作。

启动之前需要先修改一下配置，redis的根目录下有一个redis.conf文件，可以直接改它，也可以拷到别的路径下进行修改。

主要就是把cluster模式打开，然后配一下cluster配置文件。
```
cluster-enabled yes
cluster-config-file nodes.conf
```

其他的配置，port,bind,protect-mode之类的，可以根据需求改一下，不改也没关系。如果是想在一台机器上启动多个实例的话,需要给每个实例一个配置文件， port, cluster-config-file这些配置也需要区分一下。

然后执行以下命令，分别指定不同的配置文件启动。

```
redis-server redis-6379.conf &
redis-server redis-6380.conf &
```

### 开启cluster
需要的节点都启动以后，就可以开始配置cluster了。推荐的办法是使用官方提供的redis-trib.rb工具包，这个具体操作可以参考官方文档。我们在这里试一下手动操作，这样其实可以加深对cluster原理的理解。

首先通过redis-cli命令进入任意一个redis实例中，然后一次对其他几个节点执行meet命令。
```
Cluster meet xxx:6380
```
然后执行cluster nodes命令就可以看到节点被加入到集群中了。

这之后还有一步是分配slot, 可以使用cluster setslot命令，不过由于slot比较多，分配起来很麻烦。还有另外一种方式是修改nodes.conf这个配置文件。

Nodes.conf这个配置包含了cluster相关的几乎所有信息，一般情况下无需自己去操作，redis会自动生成，可以打开看一下，里边每个节点都对应一行，一行是类似这种格式：
```
8301106a1a0b7472650f22503abea23024df17fb 127.0.0.1:6379 myself,master - 0 0 1 connected
```
然后slot的分配情况是加在最后
```
8301106a1a0b7472650f22503abea23024df17fb 127.0.0.1:6379 myself,master - 0 0 1 connected 0-8000
```
需要注意的是，全部16384(0-16383)个slot都要分配出去，不能留空；集群中每个节点都对应一个Nodes.conf文件，每个文件里的slot配置要一致。

改完以后重启所有节点，在redis-cli中执行cluster info 命令，可以看到一些关键信息
```
cluster_state:ok
cluster_slots_assigned:16384
cluster_slots_ok:16384
cluster_slots_pfail:0
cluster_slots_fail:0
cluster_known_nodes:2
cluster_size:1
```
所有slot已经分配出去，Cluster stat也变成了ok. 这样一个cluster就算搭建完毕了。

原文地址：https://lichuanyang.top/posts/9329/
---
