---
title: activemq特性之持久化
description: "深入介绍 ActiveMQ 的三种持久化方式（JDBC、KahaDB、LevelDB），重点讲解官方推荐的 KahaDB 持久化机制。"
keywords:
  - ActiveMQ
  - 持久化
  - KahaDB
  - JDBC
  - LevelDB
tags:
  - activemq
categories:
  - activemq系列文章
abbrlink: 31044
tldr: "对比ActiveMQ三种持久化方式优劣，详解KahaDB机制与使用经验，建议按队列独立配置存储目录以优化磁盘空间释放。"
cover: /img/31044.jpg
date: 2018-02-02 18:56:49
---
## 介绍
数据的持久化是很多系统都会涉及到的一个问题，尤其是redis,activemq这些数据主要是存储在内存中的。既然存在内存中，就会面临宕机时数据丢失的风险。这一问题的解决方案就是通过某种方式将数据落到磁盘上，也就是所谓的持久化。

activemq提供了三种持久化方式，分别基于jdbc, kahadb和leveldb. 目前官方最推荐的是基于kahadb的持久化。<!-- more --> jdbc是activemq最早提供的一种持久化方式，但是用数据库去做持久化确实不合适，毕竟性能有瓶颈，而且只是需要简单的读写数据，不需要数据库各种强大的功能。现在去看文档的话，连基本的配置都被埋的很深，所以这种方式我们也就不细说了。

正是由于基于jdbc的方式存在的种种问题，activemq后来就接连提供了基于kahabd和leveldb的持久化方式.[leveldb](https://github.com/google/leveldb) 是google开源的一个KV磁盘存储系统，应用很广，kahadb没找着源头，应该就是activemq团队开发的，也是一种基于磁盘的存储系统。按理说,leveldb的性能是要好一些的，之前无论是activemq的默认配置，还是文档里的推荐使用方法，都是首选leveldb. 但是有一天这个基于leveldb的持久化方式就突然被activemq废弃了，主要原因是leveldb是一个第三方系统，维护起来不如kahadb那么方便。到当前最新版本，leveldb持久化还存在不少严重问题，功能也不如kahadb完善。所以目前来说，最推荐的持久化方式就是kahadb. 接下来介绍一下基本配置。

## 基本配置
基本配置很简单，看默认配置里的就可以，打开activemq.xml。

```
        <persistenceAdapter>
            <kahaDB directory="${activemq.data}/kahadb"/>
        </persistenceAdapter>
```

这样数据会自动同步到kahadb目录下。可以去目录下看一下kahadb的文件结构，文件存储的主体是一系列的.log文件，每条需要持久化的数据会一次写入，一个log文件到达一定大小后，会新建一个新的。当一个文件内的所有消息都已经被消费完毕后，这个文件会被删除。

## 参数
参数可以查阅文档：[http://activemq.apache.org/kahadb.html](http://activemq.apache.org/kahadb.html).

列几个比较有用的：

* cleanupInterval 定期检查哪些文件需要清理的时间间隔,默认30秒
* journalMaxFileLength 每个log文件的最大大小，默认32m
* journalDiskSyncInterval, journalDiskSyncStrategy, journalMaxFileLength: 异步写磁盘相关的一些参数。异步写磁盘能够提升效率，但是会有可能丢失数据

## 使用经验
介绍几点比较有用的经验，一个是日志，可以把kahadb的trace级别日志打开,在log4j里添加org.apache.activemq.store.kahadb.MessageDatabase这个logger的配置就可以，例如
```
log4j.appender.kahadb=org.apache.log4j.RollingFileAppender
log4j.appender.kahadb.file=${activemq.base}/data/kahadb.log
log4j.appender.kahadb.maxFileSize=1024KB
log4j.appender.kahadb.maxBackupIndex=5
log4j.appender.kahadb.append=true
log4j.appender.kahadb.layout=org.apache.log4j.PatternLayout
log4j.appender.kahadb.layout.ConversionPattern=%d [%-15.15t] %-5p %-30.30c{1} - %m%n
log4j.logger.org.apache.activemq.store.kahadb.MessageDatabase=TRACE, kahadb
```

有时候会遇到kahadb文件无法被删除的问题，直接看不一定看得出来是哪些队列的原因，这份日志里就会打印出清理了哪些文件，其他文件因为什么没被清理掉等关键信息。

另一个是可以为每个队列单独配置存储目录，
```
<persistenceAdapter>
  <mKahaDB directory="${activemq.base}/data/kahadb">
    <filteredPersistenceAdapters>
      <!-- kahaDB per destinations -->
      <filteredKahaDB perDestination="true">
        <persistenceAdapter>
          <kahaDB journalMaxFileLength="32mb"/>
        </persistenceAdapter>
      </filteredKahaDB>
    </filteredPersistenceAdapters>
  </mKahaDB>
 </persistenceAdapter>
```
这样做的原因还是和存储空间有关，kahadb写文件时是按消息顺序依次写入的，删文件时则要等到这个文件内的所有消息被消费完毕。也就是说，即使这个文件里只有一条消息没被消费掉，也需要占用完整的空间。如果本身队列特别多，恰好有一个队列消费没跟上，可能它本身占用空间非常小，但是会占用大量磁盘空间无法释放。给每个队列分别配置的话就可以大大缓解这一情况。

原文地址：https://lichuanyang.top/posts/31044/
---
