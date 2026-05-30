---
title: Building a Simple High-Performance Java IP Address Country Lookup Tool
description: "A high-performance IP address country lookup tool implemented in Java, based on IP2Location data source with scheduled updates."
keywords:
  - IP address parsing
  - Java
  - IP2Location
  - high performance
categories:
  - Java
tags:
  - open-source-project
abbrlink: 36780
date: 2021-10-12 19:25:15
---
A very simple and high-performance tool for determining the country of an IP address.

<!-- more -->

## Data

The IP address database can be downloaded from http://download.ip2location.com/lite/. You can write a simple scheduled task to periodically pull the latest data. Since IP address updates are not very frequent, updating once a month or so is sufficient.

## Format

````

```
...
16781312,JP
16785408,CN
16793600,JP
...
```

````

The data format is shown above. Each line represents an IP address range, including the range's starting address and the corresponding country code. The original data actually also includes the end point of the address range, but in practice, the data we get consists of contiguous ranges, so we can omit the end addresses to save memory.

## Implementation

The implementation logic is straightforward: load all data into an array, then write a binary search algorithm.

The project is built using Spring Boot. You can run it directly with Spring Boot, or use Docker.

A minimalist page is implemented using Thymeleaf.

## Try It Out

Visit http://ip-country.lichuanyang.top/ to experience the tool.

The project source code is at https://github.com/lcy362/ip-country. If you find it useful, please give it a star (*^▽^*).

Source: https://lichuanyang.top/en/posts/36780/
