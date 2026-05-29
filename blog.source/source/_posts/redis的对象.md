---
title: redis的对象
description: "Redis 对象系统源码解析，介绍字符串、列表、哈希、集合、有序集合等对象的底层实现方式。"
tags:
  - redis
categories: redis系列
abbrlink: 25564
date: 2020-08-08 15:05:48
---

[在上一篇文章中](https://lichuanyang.top/posts/22179/)，介绍了redis的底层定义的一些数据结构。接下来，在本文中，我们就结合redis提供的对象，看看这些数据结构是如何使用的。

<!-- more -->

Redis中主要包括这些对象：字符串、列表、哈希、集合、有序集合、HyperLogLog、GEO等，本文会主要介绍这些对象是如何实现的，对于其命令，可以参考[redis官网](https://redis.io/commands)中对每个命令的说明，这里就不一个一个列了。

在介绍具体的对象之前，先看一下redis中对于对象本身的定义。

```c
typedef struct redisObject {
    unsigned type:4;
    unsigned encoding:4;
    unsigned lru:LRU_BITS; /* LRU time (relative to global lru_clock) or
                            * LFU data (least significant 8 bits frequency
                            * and most significant 16 bits access time). */
    int refcount;
    void *ptr;
} robj;
```

在一个redisObject中，prt字段就是数据的实际内容，这里的存储会应用之前讲的redis的底层数据结构。可以看到，ptr是作为引用出现在redisObject中，也就是说，redisObject本身和实际数据本身内存可能不在一起。

通过 OBJECT ENCODING KEY 这个命令，可以查看一个key底层实际使用的数据结构。

接下来，我们就具体讲一下各个对象。

## 字符串

字符串可以说是redis中最基本的一个对象类型了，set 一个普通的key,value,使用的就是字符串对象。字符串对象根据具体情况，会使用int, embstr, raw三种类型的底层编码方式。其中int很好理解，在字符串的值是数字时，就会使用int存储。embstr和raw的底层结构都是简单动态字符串（SDS）,区别在于，embstr中，redisObject和实际存储的SDS在连续的内存空间上。embstr的使用场景是字符串小于等于39字节（如无特别说明，本文中的数值都是使用redis的默认配置），大于39字节时，则使用raw编码。

## 列表对象

即list, redis中的list是一个双向队列，提供左右两侧的push,pop操作，range操作等。

list的底层实现可以是ziplist或者链表。上一篇文章中，我们介绍了ziplist是一种针对小数据集的，非常高效的数据结构。因此，在使用时，很自然的可以想到，小的list就会用ziplist实现，大的list则用链表实现。对于什么样的列表才算小，redis里使用两个判断标准，一是list中每个元素的最大长度，对应配置list-max-ziplist-value, 二是list中的元素数，对应配置list-max-ziplist-entries。

list的实际应用场景其实就是对双向队列的利用场景，比如微信朋友圈的时间线就可以通过list实现。有时候，也会拿redis的list用作消息队列。

## 哈希

即我们通常所说的map,与列表对象list, 哈希也会根据数据集的大小选用两个不同的底层结构，分别是ziplist和hashTable(底层是字典)。

这里可以引申出一个小技巧，当我们需要在redis中存储object时，可以使用hash，而非序列化成字符串存储。因为对于一个正常的object来说，是会被通过ziplist存储的。这样，就通过非常小的资源开销实现了对单个字段的get/set.

## 集合对象

即set, 对应redis中的S系列命令，如SADD,SMEMBERS等，也就是元素不重复的"集合"。同样的，redis的集合也有两种实现方式，分别是intset和hashTable.

redis的集合提供了非常方便的求交集、并集、差集等的方法，可以用在查询共同好友等场景中。

## 有序集合

对应redis中的Z系列命令，如ZADD,ZRANK等，底层的实现对应ziplist或者skiplist。期数，看完上一篇文章中对于这两个数据结构的介绍，我们是可以很容易的理解redis是如何实现有序集合的。

有序集合也是一种很常用的对象，可以用在排行榜、topK等问题中。

## HyperLogLog

redis中的hyperLogLog是一个用于基数统计的结构，即统计不重复元素的个数。它的实现是基于概率算法，通过一定概率的误差，在对空间使用非常小的情况下，实现对大数据量的统计。其具体算法非常精妙，我后边会单开一篇文章介绍。这里就先介绍下它的效果，HyperLogLog可以使用12k的空间统计2的64次方的数据，标准误差在0.81%。

Redis中使用HyperLogLog非常简单，只包含三条命令，PFADD添加元素，PFCOUNT获取当前基数，PFMERGE对多个HyperLogLog进行合并。

## GEO

顾名思义，redis中的geo就是一种用来处理位置相关信息的结构。redis中的geo对象提供了添加、查看位置信息，计算两个位置间的距离，查找范围内的元素这些功能。

Geo的底层基于zset实现。其核心处理在于通过GeoHash算法将二维的经纬度编码成一维的hash值，同时还能保住经纬度本身越接近的值，hash值也越接近。GeoHash的细节我们也在后续文章中专门做介绍。经过GeoHash做编码后，就可以利用zset本身的功能来做范围查找等事情了。

现在很多互联网服务的位置服务会选择使用redis来实现，比如附近的人，附近的餐厅。

通过上边的介绍，希望可以帮助大家更好的理解和使用redis。可以看到，redis里针对一些特定情况，进行了非常极致的内存优化，而我们在使用时，就要考虑如何更好的去利用这些优化。

原文地址： https://lichuanyang.top/posts/25564/

