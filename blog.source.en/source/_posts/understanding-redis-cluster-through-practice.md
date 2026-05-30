---
title: 'Understanding Redis Cluster Through Practice'
tags:
  - redis
  - redis-cluster
abbrlink: 9329
date: 2017-04-14 20:02:00
---

Redis Cluster is an official clustering solution provided by Redis. It has been available as a stable release since version 3.0, is widely adopted, and has stood the test of time. Personally, I believe it can fully replace other clustering solutions like Codis and Twemproxy.

## Cluster Principles

Cluster implements data sharding. A Redis Cluster contains 16,384 hash slots. Any key can be mapped to a specific slot using the formula `CRC16(key) % 16384`. Which slot belongs to which node is predetermined. Therefore, for any operation, the system first computes the target node based on the key, then performs the operation on that node.

In essence, compared to a single-node setup, cluster only adds the step of computing the sharding value for a key — it doesn't add much complexity at all, so you can use it with confidence.

With this design, operations on nodes are also convenient and don't impact the client:

1. **Adding a node**: Transfer some slots from existing nodes to the new node.
2. **Removing a node**: Transfer the node's slots to other nodes, then remove the empty node.
3. **Node failure**: Operations routed to the failed node will fail, but the rest of the cluster remains accessible normally. This avoids the "avalanche" problem seen in consistent hashing. Single-node failures can also be mitigated by configuring replicas — when a node fails, its replica can take over.
4. **Node restart**: Simply restart normally — the node will automatically read its previous configuration and rejoin the cluster.

## Installation Process

Let's walk through an actual installation. Since this is for testing purposes, installing two or three nodes is sufficient. For production use, you need at least 3 master nodes, and it's recommended to also have at least 3 replica nodes.

### Installing Redis

Download the latest stable version from the Redis official website (https://redis.io/download).

Using version 3.2.8 as an example, run the following commands after downloading:
```
$ tar xzf redis-3.2.8.tar.gz
$ cd redis-3.2.8
$ make
```

Then just extract and run `make`.

### Redis Configuration and Startup

After `make`, several commands will appear in the Redis `src` directory, including `redis-server`, `redis-cli`, etc. You can copy them to `/usr/local/bin` to run from any directory, or operate directly from the `src` directory.

Before starting, you need to modify the configuration. There's a `redis.conf` file in the Redis root directory — you can edit it directly or copy it to another path for modification.

The main thing is to enable cluster mode and configure the cluster config file:
```
cluster-enabled yes
cluster-config-file nodes.conf
```

Other settings like `port`, `bind`, `protect-mode`, etc., can be modified as needed, or left as default. If you want to run multiple instances on a single machine, each instance needs its own config file, and settings like `port` and `cluster-config-file` must differ between instances.

Then start each instance with its respective config file:
```
redis-server redis-6379.conf &
redis-server redis-6380.conf &
```

### Enabling Cluster

Once all required nodes are running, you can start configuring the cluster. The recommended approach is to use the official `redis-trib.rb` tool — see the official documentation for details. Here, let's try manual setup to deepen our understanding of how the cluster works.

First, enter any Redis instance using `redis-cli`, then run the `meet` command to connect to each of the other nodes:
```
Cluster meet xxx:6380
```

Then run `cluster nodes` to see the nodes have been added to the cluster.

Next, you need to assign slots. You can use the `cluster setslot` command, but since there are many slots, this is tedious. An alternative is to modify the `nodes.conf` file directly.

The `nodes.conf` file contains nearly all cluster-related information. Normally, you don't need to modify it manually — Redis generates it automatically. You can open it to take a look. Each node has one line in a format like this:
```
8301106a1a0b7472650f22503abea23024df17fb 127.0.0.1:6379 myself,master - 0 0 1 connected
```

Slot assignments are appended at the end:
```
8301106a1a0b7472650f22503abea23024df17fb 127.0.0.1:6379 myself,master - 0 0 1 connected 0-8000
```

Note that all 16,384 slots (0–16383) must be assigned — none can be left unassigned. Each node in the cluster has its own `nodes.conf` file, and the slot configurations must be consistent across all files.

After making changes, restart all nodes. Execute `cluster info` in `redis-cli` to see key information:
```
cluster_state:ok
cluster_slots_assigned:16384
cluster_slots_ok:16384
cluster_slots_pfail:0
cluster_slots_fail:0
cluster_known_nodes:2
cluster_size:1
```

All slots have been assigned, and the cluster state shows `ok`. This completes the cluster setup.

Source: https://lichuanyang.top/en/posts/9329/
