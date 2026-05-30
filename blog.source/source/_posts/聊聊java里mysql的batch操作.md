---
title: 通过mysql批量操作不生效问题聊聊java里mysql的batch
description: "分析 Java 中 MySQL 批量操作不生效的常见原因，排查 batch 性能异常的完整思路。"
keywords:
  - Java
  - MySQL
  - batch
  - 批量操作
  - JDBC
categories:
  - 数据库
tags:
  - java
  - mysql
  - batch不生效
abbrlink: 63688
date: 2020-03-13 17:54:38
---
众所周知，对于mysql，使用批量操作，可以大幅度提升大数据量下操作的性能。不过，在java中使用mysql时，有些细节务必注意，否则就会导致batch操作不生效，也就享受不到批量操作的性能了。

<!-- more -->

前阵子，发现一条sql的性能明细不正常，几千条数据批量insert，耗时居然到了秒级。排除了服务器性能、网络的问题后，开始怀疑是代码的问题，导致batch操作没有真正生效，感觉只有一条一条去跟数据库交互的话才会出现这种性能。

调了一下代码，翻到了mysql-connector里，关键的代码是这么一块：

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

可以看到有executeBatchedInserts和executeBatchSerially两个分支，如果执行到executeBatchSerially的话，其实就是执行了个“假的”batch, 在这个方法里会每条数据单独去跟mysql交互。

为了能顺利的执行进executeBatchedInserts， 可以看到有一些先决条件：batchHasPlainStatements， connection.getRewriteBatchedStatements()， canRewriteAsMultiValueInsertAtSqlLevel。

事实上，为了能顺利的执行批量sql, mysql的驱动会对sql做一次“改写（rewrite）”，这个改写是什么意思呢？其实很简单，比如本来有一堆sql:

```sql
insert into () values()
insert into () values()
...
insert into () values()
```

改写完之后，变成了这样:

```sql
insert into () values () () ()
```

变成了一条sql, 当然就是与mysql交互一次了。

成功rewrite后，才能批量执行sql。上边的几个条件也基本都是为了能让sql进行改写。这里边关键的其实就是两个点，一是数据库连接层面，需要配置rewriteBatchedStatements=true， 允许对sql进行改写。第二是sql层面，得要求这个sql能被改写。我们知道，mysql有这样一种语法:

```sql
insert into () set x=x,y=y
```

这种语法本身不属于sql标准，是mysql的“方言”，也是没有批量操作的形式的。因此，如果把sql写成这种形式，就不然没法执行真正的批量操作了。

原文地址: https://lichuanyang.top/posts/63688/
---
