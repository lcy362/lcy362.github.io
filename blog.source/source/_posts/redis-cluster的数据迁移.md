---
title: redis cluster的数据迁移
description: "Redis Cluster 数据迁移的详细过程，包括 slot 转移机制和迁移过程中集群可用性分析。"
keywords:
  - Redis
  - Cluster
  - 数据迁移
  - slot
  - 集群
  - 高可用
tags:
  - redis
  - redis-cluster
categories:
  - redis系列
abbrlink: 37583
date: 2018-02-24 18:34:19
---
在之前的一篇文章[通过实际操作理解redis cluster原理](https://lichuanyang.top/posts/9329/)中，我们简单介绍过redis cluster的设计原理。redis cluster中的数据是根据一定规则分配到16384个slot中，这些slot又根据配置对应到不同的节点上。我们知道，在集群稳定运行后，仍然可以以slot为单位转移数据，不过对于具体的转移过程，包括转移过程中集群的可用性等问题，一直不是太确定，所以这次详细了解了一下。
<!-- more -->

## 整体流程
redis官方文档中提供的数据迁移办法是借助redis-trib脚本，其实严格来说，这个redis-trib并不是redis本体的一部分，它只是官方按照redis设计规范实现的一套脚本集合，帮助用户更方便的使用redis-cluster。 实际上，我们完全可以脱离这个脚本来使用cluster, 或者用其他方式实现这套逻辑，比如搜狐tv的redis运维工具cachecloud里，就用java实现了整套逻辑。

我们可以参考redis-trip或者cachecloud的代码来了解cluster数据迁移的流程，主要分为如下几部:

1. 设定迁移中的节点状态，比如要把slot x的数据从节点A迁移到节点B的话，需要把A设置成MIGRATING状态，B设置成IMPORTING状态。
	```
	CLUSTER SETSLOT <slot> IMPORTING <node_id>
	```
	```
	CLUSTER SETSLOT <slot> MIGRATING <node_id>
	```
2. 迁移数据，这一步首先使用CLUSTER GETKEYSINSLOT 命令获取该slot中所有的key, 然后每个key依次用MIGRATE命令转移数据。
3. 数据转移完毕之后，正式将slot指派给新的节点B
	```
	CLUSTER SETSLOT <slot> NODE <node_id>
	```
	
## 可用性
在整个迁移中，会出现对于单个key的阻塞情况，原因是MIGRATE命令是原子性的，在单个key的迁移过程中，对这个key的访问会被阻塞。但是，一般来说，一个key的数据不会特别大，所以绝大多数情况下瞬间都能完成，所以一般不会真正影响使用。而其他任何情况都不会造成集群的不可用，如果出现了，比如出现slot级的不可用，说明client端的处理存在某些问题。接下来，本文也会介绍一些client端使用的注意事项。

## ASK和MOVED转向
前边说了，redis cluster的数据迁移基本不会影响集群使用，但是，在数据从节点A迁移到B的过程中，数据可能在A上，也可能在B上，redis是怎么知道要到哪个节点上去找的呢？这里就要先介绍一下ask和moved这两个转向信号了。顾名思义，出现这个信息就说明需要的数据并不在当前节点上，需要做一次转向处理，其中，MOVED是永久转向信号，ASK则表示只需要这一次操作做转向。

比如，在节点A向节点B的数据迁移过程中，各个key分散在节点A和节点B中,所以当客户端在A中没找到某个key时,就会得到一个ASK，然后再去B中查找，实际上就是多查一次。

需要注意的是，客户端查询B时，需要先发一条ASKING命令，否则这个针对带有IMPORTING状态的槽的命令请求将被节点B拒绝执行。

对于客户端，简单来说就是，收到MOVED时，需要更新slot映射信息，收到ASK时，则需要向新节点发ASKING命令并重新执行操作。

看了一下jedis代码，也正是按照这个逻辑实现的。

```java
} catch (JedisRedirectionException jre) {
      // if MOVED redirection occurred,
      if (jre instanceof JedisMovedDataException) {
        // it rebuilds cluster's slot cache
        // recommended by Redis cluster specification
        this.connectionHandler.renewSlotCache(connection);
      }

      // release current connection before recursion or renewing
      releaseConnection(connection);
      connection = null;

      if (jre instanceof JedisAskDataException) {
        asking = true;
        askConnection.set(this.connectionHandler.getConnectionFromNode(jre.getTargetNode()));
      } else if (jre instanceof JedisMovedDataException) {
      } else {
        throw new JedisClusterOperationException(jre);
      }

      return runWithRetries(slot, attempts - 1, false, asking);
    } finally {
```
操作出现异常时，会分别判断MovedException和AskException,然后作相应处理。

原文地址：https://lichuanyang.top/posts/37583/
---
