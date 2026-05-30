---
title: "Troubleshooting MySQL Batch Operations in Java: Why Batches Sometimes Don't Work"
description: "Analysis of common reasons why MySQL batch operations fail in Java, along with a complete debugging approach for batch performance issues."
keywords:
  - java
  - mysql
  - batch
  - batch operations
  - jdbc
categories:
  - Database
tags:
  - java
  - mysql
  - batch-not-working
abbrlink: 63688
date: 2020-03-13 17:54:38
---
As is well known, using batch operations with MySQL can significantly improve performance when dealing with large datasets. However, when using MySQL in Java, certain details must be carefully handled; otherwise, batch operations may not actually take effect, and you won't benefit from the performance gains of batching.

<!-- more -->

Recently, I noticed that the performance profile of a particular SQL query was abnormally slow — inserting several thousand records in batch was taking on the order of seconds. After ruling out server performance and network issues, I suspected that the code was causing the batch operation to not actually be effective. It felt as though each record was being sent to the database individually.

After digging into the code, I traced the issue to the mysql-connector driver. The key code block looked like this:

```java
if (!this.batchHasPlainStatements && this.connection.getRewriteBatchedStatements()) {

                    if (canRewriteAsMultiValueInsertAtSqlLevel()) {
                        return executeBatchedInserts(batchTimeout);
                    }

                    if (this.connection.versionMeetsMinimum(4, 1, 0) && !this.batchHasPlainStatements && this.batchedArgs != null
                            && this.batchedArgs.size() > 3 /* cost of option setting rt-wise */) {
                        return executePreparedBatchAsMultiStatement(batchTimeout);
                    }
                }

                return executeBatchSerially(batchTimeout);
```

As you can see, there are two main branches: `executeBatchedInserts` and `executeBatchSerially`. If execution falls into `executeBatchSerially`, it's essentially running a "fake" batch — in this method, each record interacts with MySQL individually.

To successfully enter `executeBatchedInserts`, several preconditions must be met: `batchHasPlainStatements`, `connection.getRewriteBatchedStatements()`, and `canRewriteAsMultiValueInsertAtSqlLevel`.

In fact, to successfully execute batch SQL, the MySQL driver performs a "rewrite" on the SQL. What does this rewrite mean? It's quite simple. Suppose you have a bunch of SQL statements:

```sql
insert into () values()
insert into () values()
...
insert into () values()
```

After rewriting, they become:

```sql
insert into () values () () ()
```

This becomes a single SQL statement, which naturally means only one interaction with MySQL.

Only after a successful rewrite can batch SQL execution proceed. The conditions listed above are essentially all about enabling SQL rewriting. The two key points here are: first, at the database connection level, you need to configure `rewriteBatchedStatements=true` to allow SQL rewriting; second, at the SQL level, the SQL must be rewriteable. We know that MySQL has this syntax:

```sql
insert into () set x=x,y=y
```

This syntax is not part of the SQL standard — it's a MySQL "dialect" and does not have a batch operation form. Therefore, if you write SQL in this form, you cannot perform true batch operations.

Source: https://lichuanyang.top/en/posts/63688/
