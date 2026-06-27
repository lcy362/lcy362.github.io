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
tldr: "用 Java 实现高性能 IP 地址归属国家查询工具，基于 IP2Location 数据源，将 IP 段排序后通过二分查找定位，单次查询延迟微秒级。"
cover: /img/36780.jpg
date: 2021-10-12 19:25:15
---
一个高性能的 Java IP 地址归属国家查询工具，核心思路是用二分查找在预加载的 IP 段数组中定位，单次查询延迟在微秒级。

<!-- more -->

## 设计思路

IP 地址本质上是一个 32 位整数。所谓"IP 段"就是一段连续的整数范围。给定一个 IP，我们要找到它落在哪个 IP 段中——这是一个典型的**区间查找**问题。

最直接的做法是遍历所有 IP 段，O(n) 复杂度。但全球 IP 段有几十万个，遍历太慢。更好的做法是把 IP 段的起始地址排序后放入数组，用**二分查找**定位，O(log n) 复杂度，几十万个段只需要约 19 次比较。

## 数据源

IP 地址库数据可以从 [IP2Location Lite](http://download.ip2location.com/lite/) 免费获取。数据格式示例：

```
16781312,JP
16785408,CN
16793600,JP
```

每行包含两个字段：IP 段的**起始地址**（转换后的整数）和**国家代号**。

原始数据其实还包含 IP 段的结束地址，但 IP2Location 的数据段是**连续无间隙**的——一个段的结束地址恰好是下一个段的起始地址减一。因此我们可以只存储起始地址，结束地址自然而然地由下一个段的起始地址确定。这个优化节省了一半的内存。

## 数据结构

```java
public class IpCountryLookup {
    // IP 段的起始地址（有序）
    private final long[] startIps;
    // 对应的国家代号
    private final String[] countryCodes;
    // 总段数
    private final int size;
}
```

两个并行数组：`startIps[i]` 和 `countryCodes[i]` 一一对应。二分查找在 `startIps` 上进行，找到后从 `countryCodes` 中取结果。

## 核心实现：二分查找

```java
public String lookup(String ip) {
    long ipLong = ipToLong(ip);
    
    // 二分查找：找最后一个 <= ipLong 的起始地址
    int left = 0, right = size - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (startIps[mid] <= ipLong) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    // right 就是最后一个 <= ipLong 的位置
    if (right >= 0) {
        return countryCodes[right];
    }
    return "Unknown";
}

// IP 字符串转 long
private long ipToLong(String ip) {
    String[] parts = ip.split("\\.");
    return (Long.parseLong(parts[0]) << 24)
         + (Long.parseLong(parts[1]) << 16)
         + (Long.parseLong(parts[2]) << 8)
         + Long.parseLong(parts[3]);
}
```

## 性能数据

- **内存占用**：约 30 万条 IP 段，两个数组各 ~30 万元素，总计约 4 MB
- **查询延迟**：单次查询 < 10 微秒（二分查找约 19 次比较）
- **QPS**：单机轻松支撑百万级
- **数据更新**：IP 库约每月更新一次，定时任务自动拉取并重载

## 其他数据源对比

| 数据源 | 精度 | 免费版 | 特点 |
|--------|------|--------|------|
| IP2Location Lite | 国家 | ✓ | 数据干净，格式统一 |
| GeoIP2（MaxMind） | 城市 | ✓（有限） | 社区认可度高，Java API 完善 |
| 纯真 IP 库 | 运营商 | ✓ | 国内精度最高 |
| ipip.net | 城市/运营商 | ✗ | 国内最准确，但收费 |

如果只需要国家粒度，IP2Location Lite 足够。需要城市精度则推荐 MaxMind GeoLite2。

## 部署

项目基于 Spring Boot，支持两种运行方式：

```bash
# 直接运行
mvn spring-boot:run

# Docker
docker run -p 8080:8080 lcy362/ip-country
```

在线体验：[http://ip-country.lichuanyang.top/](http://ip-country.lichuanyang.top/)

项目源码：[https://github.com/lcy362/ip-country](https://github.com/lcy362/ip-country)

---
