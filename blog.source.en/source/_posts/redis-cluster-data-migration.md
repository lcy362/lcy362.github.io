---
title: 'Redis Cluster Data Migration'
description: "Detailed process of Redis Cluster data migration, including the slot transfer mechanism and cluster availability analysis during migration."
keywords:
  - Redis
  - Cluster
  - Data Migration
  - slot
  - cluster
  - high availability
tags:
  - redis
  - redis-cluster
categories:
  - Redis Series
abbrlink: 37583
date: 2018-02-24 18:34:19
---

In a previous article [Understanding Redis Cluster Principles Through Hands-on Practice](https://lichuanyang.top/posts/9329/), we briefly introduced the design principles of Redis Cluster. Data in Redis Cluster is distributed across 16384 slots according to certain rules, and these slots are mapped to different nodes based on the configuration. We know that after the cluster is running stably, data can still be transferred at the slot level. However, I've never been entirely sure about the specific transfer process, including cluster availability during migration. So this time I looked into it in detail.
<!-- more -->

## Overall Process

The data migration method provided in the official Redis documentation uses the redis-trib script. Strictly speaking, redis-trib is not part of Redis itself—it's just a set of scripts implemented by the official team according to Redis design specifications, to help users use Redis Cluster more conveniently. In fact, we can completely use the cluster without this script, or implement the same logic in other ways. For example, Sohu TV's Redis operations tool CacheCloud implements the entire logic in Java.

We can refer to the redis-trib or CacheCloud source code to understand the cluster data migration process, which mainly consists of the following steps:

1. Set the node states for migration. For example, to migrate data of slot x from Node A to Node B, we need to set A to MIGRATING state and B to IMPORTING state.
	```
	CLUSTER SETSLOT <slot> IMPORTING <node_id>
	```
	```
	CLUSTER SETSLOT <slot> MIGRATING <node_id>
	```
2. Migrate data. This step first uses the CLUSTER GETKEYSINSLOT command to get all keys in that slot, then transfers each key's data using the MIGRATE command one by one.
3. After the data transfer is complete, officially assign the slot to the new Node B.
	```
	CLUSTER SETSLOT <slot> NODE <node_id>
	```
	
## Availability

During the entire migration process, there will be blocking for individual keys. This is because the MIGRATE command is atomic—during the migration of a single key, access to that key will be blocked. However, in general, a single key's data won't be particularly large, so in most cases it completes instantly and generally won't actually affect usage. Any other situation won't cause cluster unavailability. If it does occur—for example, slot-level unavailability—it indicates there are some issues with the client-side handling. This article will also cover some client-side usage considerations.

## ASK and MOVED Redirections

As mentioned earlier, Redis Cluster data migration basically won't affect cluster usage. However, during the data transfer from Node A to Node B, the data might be on A or on B. How does Redis know which node to look for? This is where we need to introduce the ASK and MOVED redirection signals. As the names suggest, this information means the data needed is not on the current node and requires a redirection. MOVED is a permanent redirection signal, while ASK indicates that only this particular operation needs redirection.

For example, during the data migration from Node A to Node B, various keys are scattered across both nodes. So when the client doesn't find a certain key on A, it receives an ASK redirection and then goes to look on B—essentially requiring one extra lookup.

It's worth noting that when querying B, the client needs to first send an ASKING command; otherwise, the request targeting a slot in IMPORTING state will be rejected by Node B.

For the client, simply put: when receiving MOVED, it needs to update the slot mapping information; when receiving ASK, it needs to send an ASKING command to the new node and re-execute the operation.

Looking at the Jedis source code, it implements exactly this logic:

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

When an exception occurs during operation, it separately checks for MovedException and AskException, then handles them accordingly.

Source: https://lichuanyang.top/en/posts/37583/
