---
title: About RocketMQ's readQueue and writeQueue
description: "Explains why RocketMQ splits MessageQueue into readQueue and writeQueue in its design."
keywords:
  - RocketMQ
  - MessageQueue
  - readQueue
  - writeQueue
categories:
  - Message Queue
tags:
  - rocketmq
  - message-queue
abbrlink: 32580
cover: /img/32580.jpg
tldr: RocketMQ's readQueue/writeQueue separation enables zero-loss scaling
date: 2019-05-18 15:23:02
---
RocketMQ's MessageQueue has a unique design: it splits a queue into `readQueueNums` (read queue count) and `writeQueueNums` (write queue count). In the vast majority of cases, these two values must be equal — if they diverge, serious problems arise. So why separate them? The answer lies in **smooth scaling**.

<!-- more -->

## What is a MessageQueue?

In RocketMQ, a Topic is a logical category for messages, while a MessageQueue is the physical shard of a Topic, similar to Kafka's Partition. A key constraint: **the number of Consumers must not exceed the number of Queues** — because each Queue can only be consumed by one Consumer at a time.

## Normal State: readQueue = writeQueue

Under normal conditions, `readQueueNums == writeQueueNums`. Producers write messages to all Queues, and Consumers read from all Queues — everything works as expected.

But if the two values are inconsistent:

| State | Consequence |
|-------|-------------|
| writeQueue > readQueue | Some Queues are write-only with no reads → **messages will never be consumed, causing a backlog** |
| readQueue > writeQueue | Some Consumers spin idly → **wasted resources, will never receive messages** |

If consistency works and inconsistency breaks things, what's the point of separating them?

## Core Value: Smooth Scaling

### Scaling Up (4 → 8 as an example)

Without read/write separation, the dilemma: modifying the Queue count takes effect instantly, leading to the following problems:

- If Producers are notified of new Queues first, they start writing to new Queues, but Consumers haven't picked them up yet → **writes with no reads**
- If Consumers are notified first, they start listening on new Queues, but Producers haven't started writing yet → **Consumers spin idly**

With read/write separation, a **two-step scale-up**:

| Step | Operation | State | Effect |
|------|-----------|-------|--------|
| **Step 1** | `readQueueNums: 4→8` | write=4, read=8 | Add 4 new Consumers, start listening on new Queues (no messages on new Queues yet, idling causes no harm) |
| **Step 2** | `writeQueueNums: 4→8` | write=8, read=8 | Producers start writing to new Queues, Consumers are already waiting — messages are consumed immediately |

**The entire process has no message loss and no Consumer resource waste.**

If you reverse the two steps (change write first, then read), the result is the same — since Consumer scaling is the slowest part (requires starting new instances), it makes the most sense to complete the scale-up first, then start writing messages.

### Scaling Down (8 → 4 as an example)

| Step | Operation | State | Effect |
|------|-----------|-------|--------|
| **Step 1** | `writeQueueNums: 8→4` | write=4, read=8 | Producers stop writing to the Queues being decommissioned (but Consumers are still reading, existing messages won't be lost) |
| **Step 2** | `readQueueNums: 8→4` | write=4, read=4 | After all messages in old Queues are consumed, Consumers scale down |

## Comparison: Kafka's Partition Scaling

In Kafka, the number of Partitions **can only be increased, never decreased**. Scaling up is relatively straightforward — after adding Partitions, Consumers become aware of them automatically through Rebalance. But scaling down is simply not supported in Kafka. Once the Partition count is set too high, you're stuck with it.

By separating readQueue and writeQueue, RocketMQ supports **bidirectional smooth scaling** — a design refined through production experience at Alibaba's massive scale.

## Diagram

```
Normal state: write=4, read=4
Producer ——→ [Q0][Q1][Q2][Q3] ——→ Consumer Group (4 instances)
              ✓   ✓   ✓   ✓

Scale-up Step 1: write=4, read=8
Producer ——→ [Q0][Q1][Q2][Q3] ——→ Consumer Group (8 instances)
              ✓   ✓   ✓   ✓       [Q4-Q7 waiting idle]

Scale-up Step 2: write=8, read=8
Producer ——→ [Q0][Q1][Q2][Q3][Q4][Q5][Q6][Q7] ——→ Consumer Group (8 instances)
              ✓   ✓   ✓   ✓   ✓   ✓   ✓   ✓
```

## Summary

The separation of `readQueueNums` and `writeQueueNums` is the key design that enables **lossless scaling** in RocketMQ. In day-to-day operations, these two values should remain equal, only allowed to diverge during the brief window of a scaling operation. This design may seem to violate the intuitive principle that "reads and writes should be consistent," but it is precisely this "temporary, controlled inconsistency" that makes the scaling process completely smooth.

---
