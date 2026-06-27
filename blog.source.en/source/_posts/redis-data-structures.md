---
title: Redis Data Structures
description: "Detailed explanation of Redis's underlying data structures, including SDS, ziplist, quicklist, dict, skiplist and other core data structure design and optimization."
keywords:
  - Redis
  - data structures
  - SDS
  - ziplist
  - skiplist
  - dict
tags:
  - redis
  - data-structures
  - skiplist
categories:
  - Redis Series
abbrlink: 22179
tldr: "Explains the design principles of Redis's core underlying data structures—SDS, ziplist, dict, skiplist, and more—and how to optimize structure selection based on data volume to balance memory and performance."
cover: /img/22179.jpg
date: 2020-07-11 16:47:30
---
Redis, as a widely used in-memory database, has made many extreme optimizations at the code level to achieve better performance. An important part of this is the use of underlying data structures. Redis optimizes the usage of different structures based on data volume, data size, and other factors, thereby achieving better operational efficiency and memory usage. Redis's core data structures include Simple Dynamic Strings, linked lists, dictionaries, skip lists, integer sets, and compressed lists.

Let's discuss these data structures one by one.

<!-- more -->

## Simple Dynamic Strings (SDS)

Redis is implemented in C. Let's first review C — C strings don't record string length and use a null character to mark the end. This obviously brings three problems: 1. Getting the string length requires O(n) complexity; 2. Careless operations can cause buffer overflow — for example, two strings adjacent in memory, if strcat is called on the former to concatenate other strings, it will cause overflow; 3. Some special content, such as images, audio, etc., when converted to binary, inevitably contain special characters like null characters, making them unstoreable by C strings — meaning C strings lack binary safety.

For Redis's application scenarios, the impact of all these points is actually very significant. Therefore, Redis defines a new structure for storing strings, namely SDS.

The core idea of SDS is to use an extra field to record the string length, which elegantly solves all three problems mentioned above.

Additionally, Redis has optimized SDS at the code level starting from version 4.0, improving memory usage without affecting its underlying logic.

This is the SDS source code in Redis 3.0:

```java
struct sdshdr {
    unsigned int len;
    unsigned int free;
    char buf[];
};
```

And this is the SDS source code in Redis 4.0 and later:

```java
...
  struct __attribute__ ((__packed__)) sdshdr5 {
    unsigned char flags; /* 3 lsb of type, and 5 msb of string length */
    char buf[];
};
struct __attribute__ ((__packed__)) sdshdr8 {
    uint8_t len; /* used */
    uint8_t alloc; /* excluding the header and null terminator */
    unsigned char flags; /* 3 lsb of type, 5 unused bits */
    char buf[];
};
struct __attribute__ ((__packed__)) sdshdr16 {
    uint16_t len; /* used */
    uint16_t alloc; /* excluding the header and null terminator */
    unsigned char flags; /* 3 lsb of type, 5 unused bits */
    char buf[];
};
struct __attribute__ ((__packed__)) sdshdr32 {
    uint32_t len; /* used */
    uint32_t alloc; /* excluding the header and null terminator */
    unsigned char flags; /* 3 lsb of type, 5 unused bits */
    char buf[];
};
struct __attribute__ ((__packed__)) sdshdr64 {
    uint64_t len; /* used */
    uint64_t alloc; /* excluding the header and null terminator */
    unsigned char flags; /* 3 lsb of type, 5 unused bits */
    char buf[];
};
...
...
```

As you can see, in the new version of source code, data storage uses different types such as uint8, uint16, etc., depending on the situation. In C, an int occupies 4 bytes, so for the original SDS, even when storing very little information, it would still occupy at least 8 bytes. But uint8 only occupies one byte, and uint16 only occupies 2 bytes. For small data, Redis's memory usage is significantly optimized.

Additionally, Redis has mechanisms like space pre-allocation and lazy release to reduce the number of memory allocations. The SDS implementation also ensures that most methods are compatible with C strings, reducing a lot of implementation cost.

## Linked Lists

The linked list in Redis is an ordinary doubly linked list, which I believe everyone is familiar with, so I won't go into details. The structure is as follows:

```java
typedef struct listNode {

    struct listNode *prev;

    struct listNode *next;

    void *value;

} listNode;

```

The list object in Redis uses a linked list at the underlying level.

## Dictionary

A dictionary is what we commonly call a map.

```java
typedef struct dictht {

    dictEntry **table;

    unsigned long size; //hash table length

    unsigned long sizemask;

    unsigned long used; //existing length

} dictht;

```

The dictionary in Redis is a hash table, using separate chaining to resolve hash address collisions.

Similar to HashMap in languages like Java, Redis's dictionary also has a rehash mechanism to keep its load factor within a reasonable range.

## Skip List (skiplist)

Skip list is a widely used data structure, typically serving as an alternative to AVL trees. Like AVL trees, the search complexity of skiplist is O(logn), but the implementation is much simpler. In just a few lines below, we can explain all the content of SkipList very clearly. Additionally, in concurrent environments, SkipList has significant advantages, because during the balancing process of AVL trees, many nodes may be involved, requiring many nodes to be locked. SkipList doesn't have this problem at all.

![skiplist](/img/redis/skiplist.jpg)

I found a diagram online that clearly illustrates the structure of a SkipList. A skip list is essentially a multi-level list, where each element randomly appears at certain levels, and the linked list at a given level contains all elements at or above that level.

Search in a skip list starts from the highest level, gradually descending levels to locate the specific element. For example, to find 7, the sequence would be 9->6->7.

Insertion in a skip list also starts with a search, then directly assigns a random level to the element, and adjusts pointers.

Deletion involves removing the node and then adjusting pointers.

The ordered set (sorted set) in Redis is implemented based on skip lists.

## Integer Set (intset) and Compressed List (ziplist)

These two structures are very similar, so I'll discuss them together. They are both specifically optimized for small datasets under specific conditions.

An integer set is an ordered collection, used when the collection contains only integers and the number of elements is not large.

A compressed list is similarly used when the list has very few items, and the elements can only be small integer values or short strings. It can provide functionality similar to a doubly linked list.

Since both integer sets and compressed lists are designed for small datasets, they can use contiguous memory space for storage, making the implementation much simpler. I won't go into details here.

In practice, ziplist can serve as an alternative to linked lists or dictionaries, and is used in Redis's lists, hashes, and sorted sets. Integer sets serve as alternatives to dictionaries and are used in set objects.

The above are the main data structures in Redis. Based on these structures, Redis implements a large number of fully-featured objects for us to use. Understanding the principles of these underlying structures in Redis can also help us make better use of Redis's value.

Source: https://lichuanyang.top/en/posts/22179/

---
