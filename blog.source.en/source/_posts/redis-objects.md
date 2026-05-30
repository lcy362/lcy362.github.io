---
title: Redis Objects
description: "Source code analysis of Redis object system, covering the underlying implementation of strings, lists, hashes, sets, sorted sets and other objects."
keywords:
  - Redis
  - Object System
  - Strings
  - Hashes
  - Sorted Sets
  - Data Structures
tags:
  - redis
categories:
  - redis series
abbrlink: 25564
date: 2020-08-08 15:05:48
---
[In the previous article](https://lichuanyang.top/posts/22179/), we introduced the low-level data structures defined in Redis. Next, in this article, we will combine these with the objects provided by Redis to see how these data structures are used in practice.

<!-- more -->

Redis primarily includes the following objects: strings, lists, hashes, sets, sorted sets, HyperLogLog, GEO, etc. This article will mainly cover how these objects are implemented. For their commands, you can refer to the [official Redis documentation](https://redis.io/commands), which provides detailed explanations for each command.

Before diving into specific objects, let's first take a look at Redis's definition for the object itself.

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

In a `redisObject`, the `ptr` field contains the actual data content. The storage here leverages the low-level Redis data structures we discussed earlier. As you can see, `ptr` is referenced within `redisObject` via a pointer, meaning the `redisObject` itself and the actual data may not be contiguous in memory.

Using the command `OBJECT ENCODING KEY`, you can inspect the underlying data structure actually used by a key.

Now, let's dive into each object type.

## Strings

Strings are arguably the most fundamental object type in Redis. When you `SET` a regular key-value pair, you're using a string object. String objects use one of three underlying encoding types depending on the situation: `int`, `embstr`, or `raw`. The `int` encoding is straightforward — when the string value is a number, it is stored as an integer. Both `embstr` and `raw` use a Simple Dynamic String (SDS) as the underlying structure; the difference is that with `embstr`, the `redisObject` and the SDS data occupy contiguous memory. `embstr` is used when the string is ≤ 39 bytes (using Redis's default configuration unless otherwise noted), and `raw` is used for strings larger than 39 bytes.

## Lists

A list in Redis is a doubly linked queue that provides push/pop operations from both the left and right sides, as well as range operations.

The underlying implementation of a list can be either a ziplist or a linked list. In the previous article, we introduced ziplist as an extremely efficient data structure for small datasets. So it's natural that small lists are implemented with ziplist, while larger lists use linked lists. Redis determines whether a list is "small" based on two criteria: the maximum length of each element in the list (configured by `list-max-ziplist-value`), and the number of elements in the list (configured by `list-max-ziplist-entries`).

The practical applications of lists leverage the characteristics of a doubly linked queue. For example, WeChat Moments timeline could be implemented using a Redis list. Sometimes, Redis lists are also used as message queues.

## Hashes

What we commonly refer to as a map. Similar to list objects, hash objects choose between two underlying structures based on dataset size: a ziplist or a hash table (based on a dictionary internally).

This leads to a useful tip: when you need to store an object in Redis, you can use a hash rather than serializing it into a string. For a typical object, Redis will store it using a ziplist. This way, you can achieve get/set operations on individual fields with minimal resource overhead.

## Sets

The set, corresponding to Redis's `S` series commands like `SADD`, `SMEMBERS`, etc., is a collection of unique elements. Similarly, Redis sets have two implementation methods: `intset` and hash table.

Redis sets provide convenient methods for computing intersections, unions, and differences of sets, which can be used in scenarios such as finding common friends.

## Sorted Sets

Sorted sets correspond to Redis's `Z` series commands like `ZADD`, `ZRANK`, etc., with the underlying implementation being either a ziplist or a skip list. Having read the previous article's introduction to these two data structures, it should be easy to understand how Redis implements sorted sets.

Sorted sets are a very commonly used object type, applicable to scenarios such as leaderboards and Top-K problems.

## HyperLogLog

HyperLogLog in Redis is a data structure used for cardinality estimation — counting the number of distinct elements. Its implementation is based on probabilistic algorithms, achieving counting over large data volumes with minimal memory usage through an acceptable margin of error. The specific algorithm is quite elegant, and I'll dedicate a separate article to it later. Here's a quick overview of its capability: HyperLogLog can count up to 2^64 distinct values using only 12KB of memory, with a standard error of 0.81%.

Using HyperLogLog in Redis is very simple, with just three commands: `PFADD` to add elements, `PFCOUNT` to get the current cardinality, and `PFMERGE` to merge multiple HyperLogLogs.

## GEO

As the name suggests, the GEO object in Redis is used for handling location-related information. Redis's GEO object provides functions for adding and viewing location information, calculating distances between two locations, and finding elements within a range.

The GEO object is built on top of a sorted set (zset) internally. The core mechanism involves encoding two-dimensional latitude and longitude coordinates into a one-dimensional hash value using the GeoHash algorithm, while ensuring that geographically closer coordinates produce closer hash values. We'll cover GeoHash in detail in a future article. After GeoHash encoding, the underlying zset functionality is leveraged for range queries and similar operations.

Many internet services today choose Redis for their location-based features, such as "nearby people" or "nearby restaurants."

Through the above introduction, I hope it helps you better understand and use Redis. As you can see, Redis performs extreme memory optimizations for specific scenarios, and when using Redis, we should consider how to take better advantage of these optimizations.

Source: https://lichuanyang.top/en/posts/25564/
