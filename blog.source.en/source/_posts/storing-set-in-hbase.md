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
cover: /img/46290.png
date: 2017-04-10 20:42:00
---
As we know, HBase stores data as binary key-value pairs, unlike Redis which provides built-in support for various data structures. So how can we store set-type data in HBase? One approach is to serialize the entire set as a single object and store it in HBase. However, this means that for any subsequent add, delete, update, or query operation, you must first retrieve the entire stored content, make the necessary modifications, and then overwrite the original value. This approach is clearly not ideal.

What we need at minimum has these characteristics:
1. Automatic deduplication of elements — a fundamental requirement for a set.
2. Operations on individual elements (add, delete, update) should not require processing other elements.
3. Easy querying — including querying the entire set and checking whether a specific element exists.

Here is an approach that achieves these results: store the element values as HBase qualifiers (column keys) in a single row, with the actual values being arbitrary dummy data that is not actually used.

Since HBase natively deduplicates qualifiers within a row, elements will not be duplicated. All operations on individual elements only need to operate on the corresponding qualifier. To retrieve the entire set, you can simply scan the entire row.

Source: https://lichuanyang.top/en/posts/46290/
