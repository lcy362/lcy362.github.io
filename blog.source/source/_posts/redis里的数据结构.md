---
title: redis里的数据结构
description: "Redis 底层数据结构详解，包括 SDS、ziplist、quicklist、dict、skiplist 等核心数据结构的设计与优化。"
keywords:
  - Redis
  - 数据结构
  - SDS
  - ziplist
  - skiplist
  - dict
tags:
  - redis
  - 数据结构，skiplist
categories:
  - redis系列
abbrlink: 22179
cover: /img/22179.jpg
date: 2020-07-11 16:47:30
---
Redis作为当前使用非常广泛的内存数据库，在代码层面做了很多极致的优化，已获取更好的性能。其中重要的一部分，就是对于底层数据结构的使用。Redis会根据数据量、数据大小等来优化对于不同结构的使用，从而获得更佳的运行效率和内存占用。Redis的核心数据结构包括简单动态字符串、列表、字典、跳跃表、整数集合、压缩列表。

接下来，我们就依次讲讲这些数据结构。

<!-- more -->

## 简单动态字符串（SDS）

Redis是用C语言实现的。先复习一下C，C里的字符串中不记录字符串长度，以空字符标记结尾。这样会显而易见的带来三个问题：1.获取字符串长度需要O(n)的复杂度；2.操作不慎会导致缓冲区溢出，例如内存中紧邻的两个字符串，如果对前一个调用strcat拼接其他字符串，就会造成溢出；3. 一些特殊内容，如图像、音频等转成二进制时，难免其中夹杂空字符等特殊字符，这样就无法被C字符串存储了，即C字符串不具备二进制安全性。

而这几点，对于Redis的应用场景来说，影响其实都是非常大的。因此，在redis中定义了一个新的结构，用来保存字符串，即SDS。

SDS的核心思想就是额外使用一个字段记录字符串的长度，这样，上面三个问题就都迎刃而解了。

此外，redis从4.0开始对SDS做了一个代码层面的优化，优化了内存占用，不过不影响其底层逻辑。

这是redis 3.0里SDS的源码：

```java
struct sdshdr {
    unsigned int len;
    unsigned int free;
    char buf[];
};
```

而这是redis 4.0之后SDS的源码:

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

可以看到，在新版的源码里，数据存储会根据情况使用uint8,uint16等不同类型。在C里，一个int占用4个字节，因此，对于原版的SDS来说，即使存储的信息非常少，也会固定占到8个字节。而uint8只占一个字节，uint16只占2个字节，对于小数据来说，redis的内存占用会有明显优化。

此外，redis会有空间预分配、惰性释放等机制，减少内存分配的次数。SDS的实现方式也保证了大部分方法可以兼容C字符串，减少了大量实现成本。

## 链表

Redis里的链表是一个普通的双向无环链表，相信大家都很熟悉了，就不细说了，结构如下。

```java
typedef struct listNode {

    struct listNode *prev;

    struct listNode *next;

    void *value;

} listNode;

```

Redis中的列表对象，底层就是链表。

## 字典

字典也就是我们常说的map。

```java
typedef struct dictht {

    dictEntry **table;

    unsigned long size; //hash表长度

    unsigned long sizemask;

    unsigned long used; //已有的长度

} dictht;

```

Redis中的字典是hash表，使用链地址法解决hash地址冲突。

类似于java等语言中的hashMap, redis的字典也会有rehash的机制，保证其负载因子维持在合理的范围内。

## 跳跃表 (skiplist)

Skiplist是一种应用非常广的数据结构，通常是作为AVL树的一种替代选择，和AVL树一样，skiplist的查找复杂度也是O(logn), 但是实现会简单的多，下边我们用短短的几行字就能把SkipList的所有内容讲的非常清楚。此外，在并发环境下，SkipList也会有很大优势，因为AVL数在平衡过程中，可能会涉及到很多节点，也就需要锁住很多节点，SkipList则完全不存在这种问题。

![skiplist](/img/redis/skiplist.jpg)

从网上找了一张示意图，可以很清楚的展示出SkipList的结构。跳跃表说白了就是一个多层的列表，每一个元素会随机的出现在某一层上，然后某一层的链表中会包含所有高于或等于本层的元素。

跳跃表的查找就是从高层查起，逐步降层，定位到具体元素。比如要查询7， 其顺序就是9->6->7.

跳跃表的插入也是先做一次查找，然后直接给元素设置一个随机的层数，再调整指针。

删除则是删除节点，然后调整指针。

Redis中的有序集合，就是基于跳跃表实现的。

## 整数集合(intset)和压缩列表(ziplist)

这两个结构非常像，因此就放在一起讲了。它们都是针对特定条件下的小数据集做的特定优化。

整数集合是一个有序集合，使用的条件是集合中只包含整数，且元素个数不多。

压缩列表同样是针对列表项非常少的情况，且要求元素只能是小整数值或短字符串。它可以提供类似双向链表的功能。

因为整数集合和压缩列表都是针对小数据集的，所以可以使用连续的内存空间去保存，实现也就简单了很多，这里就不细说了。

在实际应用中，zipList可以作为链表或者字典的替代品，应用在redis的列表、哈希、有序集合中。整数集合则作为字典的替代品，用在集合对象中。

以上就是redis中主要的数据结构，在这些结构的基础上，redis实现了大量功能完善的对象，供我们使用。理解了redis这些底层结构的原理，也可以帮助我们更好的发挥redis的价值。

原文地址：https://lichuanyang.top/posts/22179/
---
