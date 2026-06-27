---
title: 'Are High-Concurrency Solutions Really That Hard? A Casual Guide to High-Concurrency Design'
tags:
  - high-concurrency
  - high-concurrency-solutions
  - high-concurrency-design
description: A practical guide to high-concurrency design. Learn when concurrency is actually a problem and proven solutions like caching, queuing, and horizontal scaling.
abbrlink: 11970
cover: /img/11970.jpg
date: 2022-03-29 18:40:46
---

Does high request concurrency always lead to high-concurrency problems? Not necessarily. Imagine an application that does nothing but in-memory computation — no matter how high the request volume, you could simply add more machines to scale linearly. There would be no "high-concurrency problem" to speak of.

High-concurrency problems exist because the system has **a single-point bottleneck that can't be solved by brute-force scaling**. And in over 90% of cases, that bottleneck is the **database**.

<!-- more -->

## The Core Idea: Reduce Connections to a Single Database

At their heart, all high-concurrency technical solutions are doing the same thing — **reducing the number of concurrent connections a single database instance must handle**. Around this goal, there are six layers of techniques:

## Layer 1: System Decomposition (Business Dimension)

The coarsest optimization: physically separate databases for different business modules.

```
Monolith: All services → One database (1000 QPS)
After splitting:
  User Service  → User DB  (400 QPS)
  Order Service → Order DB (300 QPS)
  Product Service → Product DB (300 QPS)
```

Each business gets its own dedicated database, operating independently. The challenge with splitting is distributed transactions — what used to be handled in a single transaction now spans multiple databases. Solutions include the Saga pattern, Seata, and RocketMQ transactional messages.

## Layer 2: Caching (Reduce Database Hit Rate)

Add a Redis layer between the application and the database. Hot data is served from the cache, and only cold data hits the database.

```
Request → Cache (90% hit) → Return
        → Cache (10% miss) → Database → Write to cache → Return
```

Key decisions in cache architecture:

| Problem | Solution |
|---------|----------|
| Cache Penetration | Bloom filter, null-value caching |
| Cache Breakdown | Mutex lock, logical expiration |
| Cache Avalanche | Randomized TTL, multi-level caching |
| Cache Consistency | Cache Aside pattern (update DB first, then delete cache) |

## Layer 3: MQ Peak Shaving (Smooth the Traffic)

When traffic surges like a flood, the message queue acts as a "reservoir":

```
100K QPS → MQ → 1000 QPS steady consumption → Database
```

Take flash sales as an example: 100,000 users place orders simultaneously, but the database can only handle 1,000 per second. Use RocketMQ/Kafka as a buffer — requests enter the queue first, and backend services consume at their own pace. The user experience changes to "waiting in line" instead of "system crash."

## Layer 4: Sharding & Table Splitting (Within a Single Business)

When even a single business's database can't keep up, split it further:

- **Vertical splitting**: Split by columns — user basic info in one table, user extended info in another
- **Horizontal splitting (sharding)**: Split by rows — user_0, user_1, user_2... routed by user_id modulo
- **Read-write separation**: Primary for writes, replicas for reads — ideal for read-heavy workloads

The key to sharding is **choosing the right sharding key** — make sure most queries land on a single shard to avoid cross-shard queries. ShardingSphere is currently the most popular sharding middleware.

## Layer 5: Heterogeneous Storage (The Right Engine for the Right Job)

MySQL isn't a silver bullet. Different query types call for different storage engines:

| Engine | Strengths | Use Cases |
|--------|-----------|-----------|
| MySQL | Transactions, joins | Core business data |
| Elasticsearch | Full-text search, aggregations | Product search, log queries |
| ClickHouse | OLAP analysis, massive aggregations | User behavior analysis, BI reports |
| Redis | Ultra-high QPS, simple KV | Caching, counters, leaderboards |
| HBase | Massive sparse data, wide tables | User profiles, time-series data |

## Layer 6: Rate Limiting & Circuit Breaking (Last-Resort Protection)

The previous layers are "best effort" — rate limiting ensures the **lower bound**: even if the system can't handle it all, don't let the whole thing collapse.

Common rate-limiting algorithms:

- **Token Bucket** (Guava RateLimiter): Tokens are added at a steady rate; requests consume tokens. If no token is available, the request is rejected.
- **Leaky Bucket**: Requests pour in like water; the bucket leaks at a fixed rate. If the bucket is full, the request overflows (is rejected).
- **Sliding Window** (Sentinel): Counts requests within a time window; rejects when the threshold is exceeded.

**Circuit Breaker**: When a downstream service keeps failing, stop making futile calls — fail fast and give the downstream room to recover. The evolution path: Hystrix (discontinued) → Resilience4j → Sentinel.

## High-Concurrency Architecture Overview

```
                     ┌──────────────┐
  Rate Limiting ←────│Load Balancer │────→ Rate Limiting
                     └──────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
         ┌─────────┐  ┌─────────┐  ┌─────────┐
         │  User   │  │  Order  │  │ Product │  ← System Decomposition
         │ Service │  │ Service │  │ Service │
         └────┬────┘  └────┬────┘  └────┬────┘
              │             │             │
         ┌────▼────┐  ┌────▼────┐  ┌────▼────┐
         │  Redis  │  │   MQ    │  │   ES    │  ← Cache / Peak Shaving / Heterogeneous Storage
         └────┬────┘  └────┬────┘  └────┬────┘
              │             │             │
         ┌────▼─────────────▼─────────────▼────┐
         │       MySQL (Sharded & Split)       │  ← Sharding
         │  user_0  user_1  order_0  order_1  │
         └─────────────────────────────────────┘
```

## Pool Tuning (Connection Pools & Thread Pools)

Various "pools" are essentially a form of rate limiting themselves:

- **Tomcat Thread Pool**: Caps the number of concurrent HTTP requests
- **Database Connection Pool** (HikariCP): Caps the number of concurrent connections to the database
- **Thread Pools**: Caps the number of concurrently executing tasks

Tuning principles:
- **Don't make pools too large**: Exceeding the database's capacity means everything slows down
- **Don't make pools too small**: Resources go underutilized
- **Monitor everything**: activeCount, queueSize, waitCount — if any of these approach their limit, it's time to scale up

## Summary

High concurrency is fundamentally a "traffic management" problem. Six layers of techniques progressively reduce the connection load on a single database, from coarse to fine:

> System Decomposition → Caching → MQ Peak Shaving → Sharding → Heterogeneous Storage → Rate Limiting & Circuit Breaking

Once you grasp this core thread of "reducing connections to a single database," you'll see that various high-concurrency techniques aren't scattered tricks — they form a clear, layered system.
