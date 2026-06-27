---
title: 关于rocketmq的readQueue和writeQueue
description: "解释 RocketMQ 中 MessageQueue 为什么要拆分成 readQueue 和 writeQueue 的设计原因。"
keywords:
  - RocketMQ
  - MessageQueue
  - readQueue
  - writeQueue
categories:
  - 消息队列
tags:
  - rocketMq
  - 消息队列
abbrlink: 32580
cover: /img/32580.jpg
tldr: RocketMQ的readQueue和writeQueue分离是为了实现无损扩缩容
date: 2019-05-18 15:23:02
---
RocketMQ 的 MessageQueue 有一个独特设计：将队列拆分为 `readQueueNums`（读队列数）和 `writeQueueNums`（写队列数）。这两个值在绝大多数情况下必须相等，一旦不等就会产生严重问题——那为什么要拆开？答案在于**平滑扩缩容**。

<!-- more -->

## MessageQueue 是什么？

在 RocketMQ 中，Topic 是消息的逻辑分类，而 MessageQueue 是 Topic 的物理分片，类似于 Kafka 的 Partition。关键约束：**Consumer 的数量不能超过 Queue 的数量**——因为每个 Queue 同一时间只能被一个 Consumer 消费。

## 正常状态下：readQueue = writeQueue

正常情况下，`readQueueNums == writeQueueNums`，生产者向所有 Queue 写入消息，消费者从所有 Queue 读取消息，一切正常。

但如果两者不一致：

| 状态 | 后果 |
|------|------|
| writeQueue > readQueue | 部分 Queue 有写无读 → **消息永远不会被消费，积压** |
| readQueue > writeQueue | 部分 Consumer 空跑 → **空转浪费资源，永远收不到消息** |

既然一致时没问题、不一致会出事，那拆分开的意义是什么？

## 核心价值：平滑扩缩容

### 扩容流程（以 4 → 8 为例）

没有 read/write 分离时的困境：修改 Queue 数量是瞬间生效的，会出现以下问题：

- 如果先通知 Producer 新的 Queue 数，Producer 开始向新 Queue 写消息，但 Consumer 还没感知到新 Queue → **消息有写无读**
- 如果先通知 Consumer，Consumer 开始监听新 Queue，但 Producer 还没开始写 → **Consumer 空跑**

有 read/write 分离后的**两步式扩容**：

| 步骤 | 操作 | 状态 | 效果 |
|------|------|------|------|
| **Step 1** | `readQueueNums: 4→8` | write=4, read=8 | 新增 4 个 Consumer，开始监听新 Queue（此时新 Queue 还没有消息，空跑无害） |
| **Step 2** | `writeQueueNums: 4→8` | write=8, read=8 | Producer 开始向新 Queue 写消息，Consumer 已经在等了，消息立刻被消费 |

**整个过程没有消息丢失，也没有 Consumer 空转浪费**。

如果把两个步骤反过来（先改 write 再改 read），效果也一样——因为 Consumer 扩容是最慢的（需要启动新实例），所以先完成扩容、再开始写消息是最合理的顺序。

### 缩容流程（以 8 → 4 为例）

| 步骤 | 操作 | 状态 | 效果 |
|------|------|------|------|
| **Step 1** | `writeQueueNums: 8→4` | write=4, read=8 | Producer 停止向即将下线的 Queue 写消息（但 Consumer 还在读，现有消息不会丢失） |
| **Step 2** | `readQueueNums: 8→4` | write=4, read=4 | 等待旧 Queue 中的消息全部消费完后，Consumer 缩小 |

## 对比：Kafka 的分区扩缩容

Kafka 的 Partition 数量**只能增加，不能减少**。扩容操作相对简单——增加 Partition 后，Consumer 通过 Rebalance 自动感知。但缩容在 Kafka 中是不支持的操作，一旦 Partition 数量设大了就只能接受。

RocketMQ 通过 readQueue/writeQueue 分离，支持了**双向平滑扩缩容**，这是在阿里大规模生产环境中打磨出来的设计智慧。

## 图解

```
正常状态：write=4, read=4
Producer ──→ [Q0][Q1][Q2][Q3] ──→ Consumer Group (4 instances)
              ✓   ✓   ✓   ✓

扩容 Step1：write=4, read=8
Producer ──→ [Q0][Q1][Q2][Q3] ──→ Consumer Group (8 instances)
              ✓   ✓   ✓   ✓       [Q4-Q7 空跑等待]

扩容 Step2：write=8, read=8
Producer ──→ [Q0][Q1][Q2][Q3][Q4][Q5][Q6][Q7] ──→ Consumer Group (8 instances)
              ✓   ✓   ✓   ✓   ✓   ✓   ✓   ✓
```

## 总结

`readQueueNums` 和 `writeQueueNums` 的分离是 RocketMQ 实现**无损扩缩容**的关键设计。日常运维中这两个值应该保持相等，只在执行扩缩容操作的短暂窗口内允许它们不同。这个设计看似违反了"读写应该一致"的直觉，但正是这种"允许短暂的、可控的不一致"，换来了扩缩容过程的完全平滑。

---
