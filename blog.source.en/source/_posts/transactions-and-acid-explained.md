---
title: "From Redo Log and Undo Log to Isolation Levels: A Deep Dive into Database Transactions and ACID"
description: "A comprehensive exploration of database transactions and ACID properties, covering redo log, undo log, and isolation levels."
keywords:
  - database transactions
  - acid
  - redo log
  - undo log
  - isolation levels
categories:
  - Database
tags:
  - database-transactions
  - database
  - acid
  - transaction-isolation-levels
abbrlink: 7774
date: 2022-02-07 16:40:02
---
Recently, I read Zhou Zhiming's book "Phoenix Architecture" and gained deeper insights into many aspects of technology. I plan to make some summaries. Today, I'll start with the section on transactions, combining content from the book with my own understanding, aiming to explain local transactions clearly and thoroughly. If there are any inaccuracies, I welcome corrections.

<!-- more -->

A transaction ensures that data in the database remains in a valid state. Through continuous CRUD operations, the database transitions from one correct state to another, without exposing intermediate "incorrect" states to the outside world.

A common example: when A has 100 yuan and B has 100 yuan, and A wants to transfer 10 yuan to B, there will inevitably be an intermediate state where A has transferred out 10 yuan but it hasn't reached B yet. A transaction ensures that users can only perceive two states — A:100, B:100 and A:90, B:110 — and never the strange intermediate state of A:90, B:100, etc.

This description actually corresponds to the Consistency property in ACID. While ACID is a popular term, A, C, I, and D are not equally weighted concepts. Simply put, A, I, and D are methods, while C is the goal. In other words, by implementing Atomicity, Durability, and Isolation, you achieve Consistency — and thus achieve a transaction.

Next, let's look at how each of A, I, and D can be implemented.

## Atomicity and Durability

Atomicity and Durability face many of the same implementation challenges, so they're introduced together.

Let's review the basic concepts: Atomicity means all operations within a transaction either all succeed or all fail; Durability means that once committed, completed operations are not lost.

It's worth noting that "simply implementing atomicity and durability" is not inherently difficult. The real question is "how to implement atomicity and durability with high performance" (the same applies to Isolation — only high-performance isolation is meaningful).

A key point is that writing to disk is a very expensive operation, so there is usually a memory buffer. Data to be written to disk is first written to the buffer and then flushed to disk at an appropriate time. If the system fails after a transaction is committed but before the data is flushed to disk, this unflushed data will naturally be lost, and the database loses its durability. A natural solution is to force a disk flush when the transaction commits. Is this feasible? Of course it is. But the problem is that it impacts performance. System failures are rare events, and handling this rare scenario effectively means every operation incurs additional overhead.

In practice, a common approach to this problem is to use a commit log — that is, before actually writing data, first record all information about modifications in a log. If the above failure occurs, the system can recover data based on the commit log upon restart. Since writing this log is a sequential disk write operation, its performance is far better than random disk writes, so this approach has no performance issues. After the data is truly written, a marker is added to indicate that this log entry has been persisted.

Now, let's consider whether the commit log has room for optimization. Of course it does. A major drawback of the commit log is that all actual disk operations must occur after the transaction commits. If a transaction is very large, it will occupy a significant amount of memory buffer, which also impacts system performance. The improvement is the write-ahead log (WAL) mechanism — a topic I've covered in a previous article ([https://lichuanyang.top/posts/3914/](https://lichuanyang.top/posts/3914/)). WAL is very similar to the commit log — it also sequentially writes a log file, with the only difference being that WAL allows writing before the transaction commits. MySQL's redo log is a typical implementation of write-ahead logging.

At this point, let's pause and review the above content. You'll notice that most of it actually discusses durability, because with these mechanisms, atomicity comes naturally — if the commit log is written, the transaction is effectively complete; if the commit log is not written, the transaction effectively never happened. However, with write-ahead logging, the situation is different: a transaction involves multiple disk writes, so atomicity is no longer guaranteed. Therefore, additional mechanisms are needed to ensure atomicity. Undo logs are a typical approach for this purpose. Before writing data changes to disk, the undo log must first be recorded, noting which data was modified, the original value, and the new value, so that during transaction rollback or crash recovery, data changes written earlier can be undone based on the undo log.

In MySQL, this is essentially what happens: redo logs and undo logs are used together to implement efficient and reliable durability and atomicity.

## Isolation and Isolation Levels

How to implement isolation between transactions? A natural approach is locking, and this is indeed how conventional databases are implemented. Generally, there are several types of locks: read locks (also called shared locks), write locks (also called exclusive locks), and range locks.

For a given piece of data, only one transaction can hold a write lock; different transactions can simultaneously hold read locks. Once a data item has a read lock, a write lock cannot be added, and once it has a write lock, a read lock cannot be added. Range locks apply a write lock to a range, preventing data writes within that range.

We know that databases have four common isolation levels: Serializable, Repeatable Read, Read Committed, and Read Uncommitted. The difference between them is essentially the granularity of locking.

If we add all possible locks to all operations, the result is effectively serializable execution. This approach provides excellent isolation but terrible performance, so it's generally not used.

Repeatable Read adds read and write locks to all involved data and holds them until the transaction ends, but does not add range locks. This can lead to phantom reads — if two range queries are executed within a transaction, and new data is inserted between them, the two queries may return inconsistent results.

Read Committed differs from Repeatable Read in that its read locks are released immediately after the query completes. This means that during transaction execution, data that has been read can be modified by other transactions, leading to non-repeatable reads.

Under Read Uncommitted, no read locks are added at all. The problem this causes is that read operations don't request read locks, which actually allows reading data that has write locks from other transactions — leading to dirty reads.

Ultimately, isolation and performance are contradictory requirements. The more locks you add, the better the isolation, but the worse the performance. We need to decide the appropriate locking level based on the actual use case.

Another approach is to look for alternatives beyond locking. Considering the 80/20 principle, can we sacrifice 20% of performance to solve 80% of the problem? Specifically, isolation problems can be simplified into two scenarios: one read transaction plus one write transaction, and two write transactions. In most cases, the read-plus-write scenario is more common, so we look for ways to solve phantom reads in that scenario. Many of you have probably already guessed — this is MVCC (Multi-Version Concurrency Control). There is abundant information about MVCC online, so I won't go into further detail here.

After the above introduction to the various transaction properties, I believe you now have a deep understanding of local transactions. If you have any questions, feel free to leave a comment. In the next article, I will discuss distributed transactions. If you're interested, you can follow my personal blog, Zhihu, or WeChat official account for updates~

Source: https://lichuanyang.top/en/posts/7774/
