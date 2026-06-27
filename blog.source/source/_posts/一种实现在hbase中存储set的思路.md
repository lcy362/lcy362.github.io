---
title: 一种实现在hbase中存储set的思路
description: "在 HBase 中实现 Set 数据结构的存储方案，解决 HBase 原生不支持集合类型的限制。"
keywords:
  - HBase
  - Set
  - 数据结构
  - 存储设计
  - 大数据
categories:
  - 大数据
tags:
  - hbase
abbrlink: 46290
tldr: "利用HBase qualifier唯一性天然实现Set去重，元素作为qualifier名存储，增删查均为O(1)原子操作，解决HBase不支持集合类型的难题。"
cover: /img/46290.jpg
date: 2017-04-10 20:42:00
---
HBase 的存储模型是简单的键值对（rowkey → column family → qualifier → value），不像 Redis 那样原生支持 Set、List、Hash 等数据结构。但实际业务中，我们经常需要存储集合类型的数据——比如用户的标签集合、商品的属性集合、社交关系中的好友列表。

如何在 HBase 中优雅地实现一个 Set？本文介绍一种利用 HBase 列（qualifier）特性实现的高效方案。

<!-- more -->

## 需求定义

一个合格的 Set 存储方案需要满足：

1. **元素自动去重**——Set 的基本语义
2. **原子操作单个元素**——增删查改不应影响其他元素
3. **方便查询**——能快速获取整个 Set，也能快速判断某个元素是否存在

## 方案对比

### 方案 A：整体序列化

把整个 Set 序列化为一个字节数组，存到 HBase 的某个 cell 中。

```java
// 写
Set<String> set = new HashSet<>(Arrays.asList("a", "b", "c"));
byte[] bytes = serialize(set);
Put put = new Put(Bytes.toBytes("row1"));
put.addColumn(Bytes.toBytes("cf"), Bytes.toBytes("set"), bytes);
table.put(put);

// 读 → 修改 → 覆盖
Get get = new Get(Bytes.toBytes("row1"));
Result result = table.get(get);
Set<String> set = deserialize(result.getValue(Bytes.toBytes("cf"), Bytes.toBytes("set")));
set.add("d");  // 修改
// 再整体写回去...
```

**缺点显而易见**：每次增删改都需要"读-改-写"三个步骤，不是原子操作，并发场景下会丢数据。

### 方案 B：一行一个元素

```
rowkey     cf:qualifier     value
user_a     cf:element       a
user_b     cf:element       b
user_c     cf:element       c
```

每个 Set 元素存成独立的一行，rowkey 设计为 `set_id + element`。Scan 时用前缀匹配获取整个 Set。

**缺点**：要获取整个 Set 需要 scan 多行，效率比方案 C 低。

### 方案 C：Qualifier 方案（推荐）

将 Set 的元素值存在 **qualifier** 中，value 随便填一个值（如 `"1"`）：

```
rowkey     cf:qualifier    value
set_123    cf:a            1
set_123    cf:b            1
set_123    cf:c            1
```

**核心优势**：

| 操作 | HBase 命令 | 复杂度 |
|------|-----------|--------|
| 添加元素 | `put.addColumn(cf, "d", "1")` | O(1) |
| 删除元素 | `delete.addColumn(cf, "d")` | O(1) |
| 判断存在 | `get.addColumn(cf, "d")` → 判断 result 是否为空 | O(1) |
| 获取全量 | `get.addFamily(cf)` → 遍历 qualifier | O(n) |

由于 HBase 的 qualifier 在同一行同一列族下是**唯一的**，天然实现了去重。

示例代码：

```java
// 添加元素
Put put = new Put(Bytes.toBytes("set:user:1001"));
put.addColumn(Bytes.toBytes("tags"), Bytes.toBytes("vip"), Bytes.toBytes("1"));
put.addColumn(Bytes.toBytes("tags"), Bytes.toBytes("premium"), Bytes.toBytes("1"));
table.put(put);

// 判断元素是否存在
Get get = new Get(Bytes.toBytes("set:user:1001"));
get.addColumn(Bytes.toBytes("tags"), Bytes.toBytes("vip"));
boolean exists = table.exists(get);

// 获取全量
Get getAll = new Get(Bytes.toBytes("set:user:1001"));
getAll.addFamily(Bytes.toBytes("tags"));
Result result = table.get(getAll);
NavigableMap<byte[], byte[]> familyMap = result.getFamilyMap(Bytes.toBytes("tags"));
Set<String> elements = familyMap.keySet().stream()
    .map(Bytes::toString)
    .collect(Collectors.toSet());
```

## 局限性

- **Qualifier 大小限制**：单个 qualifier 不应太大（HBase 是按行存储，qualifier 过大影响性能）
- **单行列数上限**：一行中的列数不宜过多（百万级会有性能问题），如果 Set 元素数量非常大，需要考虑分区
- **不支持排序**：qualifier 按字典序排列，如果需要有序 Set，需要自定义排序逻辑

## 扩展：带权重的 Set

如果需要类似 Redis Sorted Set 的功能（每个元素有 score），可以把 score 放在 value 中：

```
rowkey     cf:qualifier    value
rank       cf:Alice        95.5
rank       cf:Bob          87.0
rank       cf:Carol        92.3
```

获取时扫描所有 qualifier，在应用层按 value 排序即可。

如果你在 HBase 数据建模中遇到过类似的结构化存储需求，这个方案可以作为一个简洁的参考。
---
