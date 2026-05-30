---
title: 'Are High-Concurrency Solutions Really That Hard? A Casual Guide to High-Concurrency Design'
tags:
  - high-concurrency
  - high-concurrency-solutions
  - high-concurrency-design
abbrlink: 11970
date: 2022-03-29 18:40:46
---

Does high request concurrency always lead to high-concurrency problems? Not necessarily. Imagine if our application were entirely in-memory — no matter how high the request volume, we could simply add more nodes to solve the problem, and there would be no so-called high-concurrency issue. High-concurrency problems exist because there are single-point bottlenecks in the system that cannot be resolved through brute-force scaling, which is why we need to find alternative solutions.

<!-- more -->

In fact, in the vast majority of cases, this bottleneck is the database.

For over 90% of scenarios, the fundamental difficulty of high concurrency lies in the fact that a database can only handle a limited number of concurrent connections. And at their core, all high-concurrency technical solutions are ultimately about reducing the number of connections to a single database, such as:

- **System decomposition**: Separate databases for different businesses so each business has its own dedicated database.
- **Caching**: Use caching to reduce the proportion of requests that need to hit the database.
- **MQ-based peak shaving**: Use message queues to avoid sudden spikes in database connections.
- **Sharding, table splitting, and read-write separation**: Further split a single business's database to reduce per-database load.
- **Introducing other storage systems like Elasticsearch or ClickHouse**: Similar to the above, offload workloads that aren't well-suited to MySQL, further reducing MySQL concurrency.

The approach above focuses on improving the application's processing capability — if not every request needs to hit the database, the system can naturally handle higher concurrency.

Another direction is **rate limiting**. The main purpose of rate limiting is twofold: first, ensure that requests within the system's processing capacity can be handled normally without dragging down all requests; second, even if something goes wrong, the impact is confined to a small scope.

There are many rate-limiting approaches, such as the familiar leaky bucket and token bucket algorithms, which I won't elaborate on here.

Additionally, there are various "pools" we're familiar with, such as Tomcat connection pools, thread pools, and the MySQL connection pool within applications — all of which effectively cap the maximum number of concurrent requests.

To monitor the state of these pools, proper observability is essential — tracking metrics like Tomcat active connections, MySQL active connections, and so on. When these approach capacity, it's time to consider scaling up.

Setting appropriate pool parameters is key to ensuring that machine and database resources are fully utilized, and that when the pool isn't full, it won't exceed the database's capacity.

With this understanding, it becomes clear why most articles on high-concurrency design focus on caching, database sharding/splitting, and connection pool optimization.

Source: https://lichuanyang.top/en/posts/11970/
