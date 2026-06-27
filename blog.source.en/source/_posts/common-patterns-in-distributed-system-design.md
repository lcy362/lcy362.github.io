---
title: 'Common Patterns in Distributed System Design'
tags:
  - distributed-systems
  - distributed-system-design
description: An exploration of common patterns in distributed system design, including sharding, replication, consistency models, and fault tolerance strategies.
abbrlink: 45718
cover: /img/45718.jpg
date: 2022-04-13 20:13:24
faq:
  - What is the most important thing to learn in distributed system design? What are the core patterns?
  - What is the practical significance of the CAP theorem? Why are there no CA systems?
  - Where should a beginner start with distributed systems? Is there a recommended learning path?
  - How to make trade-off decisions between "performance" and "consistency"?
---

Previously, I translated an article about distributed systems (https://lichuanyang.top/posts/3914/) which received positive feedback across various platforms. So I recently reorganized the related knowledge, combined with new insights gained over the past year, and rewrote this article.

<!-- more -->

First, let's clarify what kind of distributed systems we're discussing here. Simply put, they need to satisfy two conditions: **multi-node** and **stateful**. Multi-node is straightforward to understand. Being stateful means the system needs to maintain some data — otherwise, we could simply scale horizontally without limit, and there would be no distributed systems problem to speak of.

Common distributed systems — whether databases like MySQL, Cassandra, HBase, message queues like RocketMQ, Kafka, Pulsar, or infrastructure like ZooKeeper — all satisfy these two conditions.

The implementation of these distributed systems typically needs to address two aspects: first, the system's own functionality; and second, maintaining good performance and stability in a distributed environment. Even two systems with completely different functions will have many similarities in how they address the second type of problem. This article focuses on the second type.

## Core Challenges of Distributed Systems

Next, let's enumerate the common goals of distributed systems, including but not limited to:

+ A large number of ordinary servers interconnected via a network, collectively providing services to the outside world.
+ As the cluster scales up, overall system performance scales linearly.
+ Automatic fault tolerance — failed nodes are automatically migrated, and data consistency across different nodes is maintained.

What are the challenges in achieving these goals? Here are the main ones:

1. **Process crashes**: Caused by many factors, including hardware failures, software bugs, routine maintenance, and in cloud environments, more complex reasons. The biggest problem with process crashes is data loss. For performance reasons, we often don't write synchronously to disk — instead, we temporarily buffer data in memory and periodically flush to disk. When a process crashes, the data in memory buffers is clearly lost.

2. **Network delays and interruptions**: When communication between nodes becomes very slow, how does one node determine whether another node is healthy?

3. **Network partitions**: The cluster's nodes split into two subsets — communication within each subset works, but communication between subsets is broken (brain split). How should the cluster continue to serve requests?

   A brief digression: under the CAP theorem, real-world systems typically adopt one of two modes — CP mode (giving up high availability) or AP mode (giving up strong consistency). Why is there no CA mode that gives up partition tolerance? Because we cannot assume network communication will always be reliable. Once a cluster splits into two partitions, re-merging is not realistic.

4. **Process pauses**: For example, a full GC may cause a process to become temporarily unavailable before quickly recovering. During the unavailable period, the cluster may have already reacted accordingly. How should state consistency be maintained when the node comes back?

5. **Clock skew and message reordering**: We want operations across different nodes in the cluster to have a clear ordering. Clock skew between nodes prevents us from using timestamps to guarantee this. Message reordering further complicates distributed system processing.

Now, let's walk through the solutions to these problems.

## Partitioning and Replication

For process crashes, the key point is that simply ensuring no data loss during a crash is not difficult at all — the real challenge is achieving this while maintaining system performance.

The first pattern to introduce is **Write-Ahead Log (WAL)**: the server stores every state change as a command in an append-only file on disk. Since append operations are sequential disk writes, they are typically very fast and can be completed without impacting performance. During server failure recovery, the log can be replayed to rebuild in-memory state.

The core idea is to first persist data in a low-cost way (not necessarily limited to sequential disk writes), then acknowledge the client without blocking other operations. The server asynchronously performs the subsequent high-cost work.

Typical scenarios and variants: MySQL redo log; Redis AOF; Kafka itself; common practices in application development — for time-consuming operations, first write a database record indicating the task will be executed, then perform the actual task asynchronously.

WAL introduces a minor issue: the log keeps growing. How to handle its own storage? Two natural approaches: **segmentation** and **cleanup**.

Segmentation splits a large log into smaller ones. Since WAL logic is generally simple, splitting is not complex — much easier than typical database sharding. This pattern is called **Segmented Log**, and the canonical implementation is Kafka's partitions.

For cleanup, there is a pattern called **low-water mark**: a marker indicating which parts of the log can be cleaned up. The marking can be based on data status (redo log), preset retention time (Kafka), or more fine-grained cleanup and compaction (AOF).

## Consistency Protocols

Moving to network-related issues, a simple **heartbeat** pattern solves inter-node state synchronization. If no heartbeat is received within a time window, the node is considered down.

For brain-split scenarios, the **Quorum** pattern is typically used. It requires the number of live nodes in the cluster to reach a Quorum value (typically, with 2f+1 nodes, at most f nodes can go down, so the Quorum value is f+1) before the cluster can serve requests. When examining implementations of distributed systems like RocketMQ or ZooKeeper, you'll find the requirement for a minimum number of live nodes — this is exactly the Quorum pattern.

Quorum solves the data durability problem — successfully written data will not be lost even if nodes fail. However, Quorum alone cannot guarantee strong consistency, because data on different nodes may differ in time. When clients connect to different nodes, they may see different results. This can be solved through the **Leader and Followers** pattern, where one node is elected as the leader to coordinate data replication across nodes and determine which data is visible to clients.

The **High-Water Mark** pattern determines which data is visible to clients. Generally, after a write is completed on a Quorum number of follower nodes, the data can be marked as visible to clients. The line of completed replication is the high-water mark.

The Leader-Followers pattern is so widely used that examples are unnecessary. There are many distributed election algorithms — Bully, ZAB, Paxos, Raft, among others. Paxos is difficult both to understand and implement. Bully triggers frequent elections when nodes go up and down frequently. Raft, on the other hand, strikes a relatively balanced trade-off in terms of stability, implementation complexity, and adoption — it is the most widely used distributed election algorithm. For example, Elasticsearch replaced Bully with Raft in version 7.0; Kafka 2.8 switched from ZooKeeper's ZAB protocol to Raft.

At this point, let's summarize. Essentially, an operation on a distributed system can be概括为 the following steps:

1. Write to the leader's Write-Ahead Log
2. Write to 1 follower's WAL
3. Write to the leader's data store
4. Write to 1 follower's data store
5. Write to a Quorum of followers' WALs
6. Write to a Quorum of followers' data stores

The order of steps 2–5 is not fixed. The most important way a distributed system balances performance and stability is, in essence, deciding the order of these operations and when to return a success acknowledgment to the client. For example, MySQL's synchronous replication, asynchronous replication, and semi-synchronous replication are classic examples of these different orderings.

## Fault Detection and Recovery

For process pauses, the main problem scenario is: suppose the leader pauses. During the pause, a new leader is elected. When the original leader recovers, what should happen? The **Generation Clock** pattern addresses this — simply put, each leader is assigned a monotonically increasing generation number to indicate which "generation" of leader it is. Concepts like Raft's "term" and ZAB's "epoch" are implementations of this Generation Clock idea.

For clock skew, in a distributed environment, clock differences between nodes are inevitable. Under the Leader-Followers pattern, this problem is already largely minimized. Many systems choose to perform all operations on the leader, with leader-follower replication taking the form of replicating and replaying logs. In this way, clock issues generally don't need to be considered. The only potential issue arises during leader failover, where the old leader and new leader might produce out-of-order data.

One solution to clock skew is to set up a dedicated synchronization service called an **NTP service**. However, this approach is not perfect — since it involves network operations, some error is inevitable. When relying on NTP to solve clock skew, the system design must tolerate very small timing errors.

Actually, beyond forcibly aligning clocks, there are simpler approaches to consider. First, let's think about a question: do we really need to ensure messages are ordered by real-world physical time? Not really. What we need is a **consistent, reproducible way to determine message order** so that all nodes agree on the order. In other words, messages don't have to follow physical chronological order, but the order determined by different nodes should be the same.

The **Lamport Clock** technique achieves this goal. Its logic is simple, as shown in the diagram:

![lamport stamp](/img/lamport.png)

Operations on a local node increment the local stamp by 1. During network communication — for example, when node C receives data from node B — it compares its current stamp with B's stamp + 1 and takes the larger value as its new stamp. This simple operation guarantees that the order of any two causally related operations (whether on the same node or communicated between nodes) is consistent across all nodes.

## Design Principles Summary

Additionally, there are relatively simpler considerations that frequently arise in distributed system design — such as how to distribute data evenly across nodes. For this, we might need to find an appropriate shard key based on the business scenario, or find a suitable hash algorithm. There is also **consistent hashing** technology, which gives us more flexibility in controlling data distribution.

Another key consideration in distributed system design is how to measure system performance, with metrics including latency, throughput, availability, consistency, and scalability. These are easy to understand conceptually, but measuring them more comprehensively — especially observing them conveniently — is itself a large topic.

Source: https://lichuanyang.top/en/posts/45718/
