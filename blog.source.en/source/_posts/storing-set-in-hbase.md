---
title: An Approach to Storing Sets in HBase
description: "A storage scheme for implementing Set data structures in HBase, addressing HBase's native lack of support for collection types."
keywords:
  - HBase
  - Set
  - Data Structures
  - Storage Design
  - Big Data
categories:
  - Big Data
tags:
  - hbase
abbrlink: 46290
cover: /img/46290.jpg
date: 2017-04-10 20:42:00
---
HBase's storage model is a simple key-value store (rowkey → column family → qualifier → value). Unlike Redis, it doesn't natively support data structures like Set, List, or Hash. Yet in real-world applications, we often need to store collection-type data — user tag sets, product attribute sets, friend lists in social graphs, to name a few.

How can we elegantly implement a Set in HBase? This article introduces an efficient approach that leverages HBase's column (qualifier) characteristics.

<!-- more -->

## Requirements Definition

A proper Set storage solution must satisfy:

1. **Automatic deduplication of elements** — fundamental Set semantics
2. **Atomic operations on individual elements** — adding, deleting, or checking one element should not affect others
3. **Convenient querying** — fast retrieval of the entire Set, and fast existence checks for individual elements

## Approach Comparison

### Approach A: Full Serialization

Serialize the entire Set as a byte array and store it in a single HBase cell.

```java
// Write
Set<String> set = new HashSet<>(Arrays.asList("a", "b", "c"));
byte[] bytes = serialize(set);
Put put = new Put(Bytes.toBytes("row1"));
put.addColumn(Bytes.toBytes("cf"), Bytes.toBytes("set"), bytes);
table.put(put);

// Read → Modify → Overwrite
Get get = new Get(Bytes.toBytes("row1"));
Result result = table.get(get);
Set<String> set = deserialize(result.getValue(Bytes.toBytes("cf"), Bytes.toBytes("set")));
set.add("d");  // modify
// Then write the whole thing back...
```

**Obvious drawbacks**: Every add/delete/modify requires a "read-modify-write" cycle, which is not atomic. Data loss is inevitable under concurrent access.

### Approach B: One Row per Element

```
rowkey       cf:qualifier     value
user_a       cf:element       a
user_b       cf:element       b
user_c       cf:element       c
```

Each Set element is stored as a separate row, with rowkey designed as `set_id + element`. Use a Scan with prefix matching to retrieve the entire Set.

**Drawback**: Retrieving the entire Set requires scanning multiple rows — less efficient than Approach C.

### Approach C: Qualifier Approach (Recommended)

Store Set element values in the **qualifier**, with an arbitrary placeholder value (e.g., `"1"`):

```
rowkey       cf:qualifier     value
set_123      cf:a             1
set_123      cf:b             1
set_123      cf:c             1
```

**Core advantages**:

| Operation | HBase Command | Complexity |
|-----------|--------------|------------|
| Add element | `put.addColumn(cf, "d", "1")` | O(1) |
| Remove element | `delete.addColumn(cf, "d")` | O(1) |
| Check existence | `get.addColumn(cf, "d")` → check if result is empty | O(1) |
| Retrieve all | `get.addFamily(cf)` → iterate qualifiers | O(n) |

Since HBase qualifiers are **unique** within the same row and column family, deduplication is naturally guaranteed.

Example code:

```java
// Add elements
Put put = new Put(Bytes.toBytes("set:user:1001"));
put.addColumn(Bytes.toBytes("tags"), Bytes.toBytes("vip"), Bytes.toBytes("1"));
put.addColumn(Bytes.toBytes("tags"), Bytes.toBytes("premium"), Bytes.toBytes("1"));
table.put(put);

// Check if an element exists
Get get = new Get(Bytes.toBytes("set:user:1001"));
get.addColumn(Bytes.toBytes("tags"), Bytes.toBytes("vip"));
boolean exists = table.exists(get);

// Retrieve the entire Set
Get getAll = new Get(Bytes.toBytes("set:user:1001"));
getAll.addFamily(Bytes.toBytes("tags"));
Result result = table.get(getAll);
NavigableMap<byte[], byte[]> familyMap = result.getFamilyMap(Bytes.toBytes("tags"));
Set<String> elements = familyMap.keySet().stream()
    .map(Bytes::toString)
    .collect(Collectors.toSet());
```

## Limitations

- **Qualifier size limit**: Individual qualifiers should not be too large (HBase stores by row, large qualifiers degrade performance)
- **Column count per row**: Having too many columns in a single row (millions+) can cause performance issues. If the Set is very large, consider partitioning
- **No native sorting**: Qualifiers are sorted in lexicographic order by default. For ordered Sets, you'll need custom sorting logic

## Extension: Weighted Set

If you need functionality similar to Redis Sorted Set (each element has a score), you can place the score in the value:

```
rowkey       cf:qualifier     value
rank         cf:Alice         95.5
rank         cf:Bob           87.0
rank         cf:Carol         92.3
```

When retrieving, scan all qualifiers and sort by value in the application layer.

If you've encountered similar structured storage needs in HBase data modeling, this approach can serve as a clean reference implementation.

---
Source: https://lichuanyang.top/en/posts/46290/

---
