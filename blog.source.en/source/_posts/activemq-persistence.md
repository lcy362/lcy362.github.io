---
title: ActiveMQ Feature - Persistence
description: "An in-depth introduction to the three persistence methods in ActiveMQ (JDBC, KahaDB, LevelDB), focusing on the officially recommended KahaDB persistence mechanism."
keywords:
  - ActiveMQ
  - persistence
  - KahaDB
  - JDBC
  - LevelDB
tags:
  - activemq
categories:
  - ActiveMQ Series
abbrlink: 31044
tldr: "A comparison of ActiveMQ's three persistence methods, with a detailed explanation of the KahaDB mechanism and practical tips. Configuring separate storage directories per queue is recommended to optimize disk space reclamation."
cover: /img/31044.jpg
date: 2018-02-02 18:56:49
---
## Introduction
Data persistence is a concern that many systems deal with, especially for systems like Redis and ActiveMQ where data is primarily stored in memory. Since data is stored in memory, there is a risk of data loss when the system crashes. The solution to this problem is to write data to disk through some mechanism — that is, **persistence**.

ActiveMQ provides three persistence methods, based on JDBC, KahaDB, and LevelDB respectively. Currently, the officially recommended method is **KahaDB-based persistence**. <!-- more --> JDBC was the earliest persistence method provided by ActiveMQ, but using a database for persistence is not really appropriate. After all, there are performance bottlenecks, and what is needed is simply read/write data storage without requiring all the powerful features of a database. If you look at the documentation now, even the basic configuration is buried deep, so we will not go into detail about this method.

Precisely because of the various problems with JDBC-based persistence, ActiveMQ subsequently introduced persistence methods based on KahaDB and LevelDB. [LevelDB](https://github.com/google/leveldb) is a key-value disk storage system open-sourced by Google, widely used in many applications. KahaDB's origin is unclear — it was likely developed by the ActiveMQ team and is also a disk-based storage system. In theory, LevelDB should have better performance. Previously, whether in ActiveMQ's default configuration or the recommended usage in the documentation, LevelDB was the preferred choice. However, one day, the LevelDB-based persistence method was suddenly deprecated by ActiveMQ. The main reason is that LevelDB is a third-party system, and maintaining it is not as convenient as KahaDB. In the current latest version, LevelDB persistence still has many serious issues and its functionality is not as complete as KahaDB. Therefore, the most recommended persistence method currently is **KahaDB**. Let's look at the basic configuration below.

## Basic Configuration
The basic configuration is very simple — just look at the default configuration. Open `activemq.xml`.

```
        <persistenceAdapter>
            <kahaDB directory="${activemq.data}/kahadb"/>
        </persistenceAdapter>
```

This way, data will be automatically synced to the KahaDB directory. You can look at the file structure in the directory. The main storage files are a series of `.log` files. Each piece of data that needs to be persisted is written sequentially. When a log file reaches a certain size, a new one is created. When all messages in a file have been consumed, that file will be deleted.

## Parameters
You can refer to the documentation for parameters: [http://activemq.apache.org/kahadb.html](http://activemq.apache.org/kahadb.html).

Here are a few useful ones:

* `cleanupInterval` — The interval for periodically checking which files need to be cleaned up. Default is 30 seconds.
* `journalMaxFileLength` — The maximum size of each log file. Default is 32MB.
* `journalDiskSyncInterval`, `journalDiskSyncStrategy`, `journalMaxFileLength` — Parameters related to asynchronous disk writing. Asynchronous disk writing can improve efficiency, but may result in data loss.

## Usage Tips
Here are a few useful tips. First, regarding logging: you can enable TRACE-level logging for KahaDB by adding a logger configuration for `org.apache.activemq.store.kahadb.MessageDatabase` in log4j. For example:

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

Sometimes you may encounter issues where KahaDB files cannot be deleted. Looking at it directly may not reveal which queues are causing the problem. This log will print out which files were cleaned up, and why other files were not cleaned up, among other key information.

Another tip is that you can configure separate storage directories for each queue:

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

The reason for doing this is related to storage space. KahaDB writes files sequentially by message order, and files can only be deleted when all messages in that file have been consumed. This means that even if there is only one unconsumed message in a file, the entire file's space must still be occupied. If there are many queues and one queue's consumption is lagging behind, it may occupy very little space itself but still hold a large amount of disk space that cannot be released. Configuring separate directories for each queue can significantly alleviate this situation.

Source: https://lichuanyang.top/en/posts/31044/
---
