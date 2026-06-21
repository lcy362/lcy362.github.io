---
title: 实现一个简单的java版本高性能获取ip地址所属国家工具
description: "用 Java 实现高性能 IP 地址归属国家查询工具，基于 IP2Location 数据源，支持定时更新。"
keywords:
  - IP地址解析
  - Java
  - IP2Location
  - 高性能
categories:
  - Java
tags:
  - 开源项目
abbrlink: 36780
cover: /img/36780.jpg
date: 2021-10-12 19:25:15
---
一个非常简单且性能优秀的的工具，用于获取某个ip地址的所属国家。

<!-- more -->

## 数据

ip地址库的数据可以从http://download.ip2location.com/lite/ 获取。可以写一个简单的定时任务，定期去拉最新的数据。由于ip地址的更新不是非常频繁，因此一个月左右更新一次就足够了。

## 格式

````
```
...
16781312,JP
16785408,CN
16793600,JP
...
```
````

数据示例如上，每行数据是一个ip地址的段，包括段的起始地址和对应国家的代号。原始数据实际上还包含地址段的结束点，不过实际上我们拿到的数据都是连续的数据段，因此我们完全可以省略掉结束地址，以节约内存。

## 实现

实现逻辑很简单，将数据全部导入到一个数组中，然后写一个二分查找就可以了。

项目整体使用springboot实现，可以直接运行springboot, 也可使用docker运行。

使用thymeleaf实现了一个极简版的页面。

## 体验

访问 http://ip-country.lichuanyang.top/ ， 简单体验工具效果。

项目源码在https://github.com/lcy362/ip-country， 如果觉得还不错，麻烦给一个star (*^▽^*)。

原文地址: https://lichuanyang.top/posts/36780/

---
