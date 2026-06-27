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
cover: /img/36780.jpg
date: 2021-10-12 19:25:15
---
A high-performance Java IP address-to-country lookup tool. The core approach uses binary search over a pre-loaded array of IP ranges, achieving microsecond-level latency per query.

<!-- more -->

## Design Thinking

An IP address is essentially a 32-bit integer. An "IP range" is simply a continuous range of integers. Given an IP, we need to find which range it falls into — a classic **interval search** problem.

The most direct approach is to iterate through all IP ranges — O(n) complexity. But there are hundreds of thousands of IP ranges globally, so iteration is too slow. A better approach is to sort the starting addresses of the IP ranges into an array and use **binary search** — O(log n) complexity, with only about 19 comparisons needed for hundreds of thousands of ranges.

## Data Source

IP address database data can be obtained for free from [IP2Location Lite](http://download.ip2location.com/lite/). Sample data format:

```
16781312,JP
16785408,CN
16793600,JP
```

Each line contains two fields: the IP range's **starting address** (converted to an integer) and the **country code**.

The original data also includes the end address of each IP range, but IP2Location's data segments are **continuous and gap-free** — the end address of one range is exactly the starting address of the next range minus one. Therefore, we can store only the starting addresses, with the end address naturally determined by the next range's starting address. This optimization saves half the memory.

## Data Structure

```java
public class IpCountryLookup {
    // IP range starting addresses (sorted)
    private final long[] startIps;
    // Corresponding country codes
    private final String[] countryCodes;
    // Total number of ranges
    private final int size;
}
```

Two parallel arrays: `startIps[i]` and `countryCodes[i]` correspond one-to-one. The binary search is performed on `startIps`, and once found, the result is taken from `countryCodes`.

## Core Implementation: Binary Search

```java
public String lookup(String ip) {
    long ipLong = ipToLong(ip);
    
    // Binary search: find the last starting address <= ipLong
    int left = 0, right = size - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (startIps[mid] <= ipLong) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    // 'right' is the position of the last element <= ipLong
    if (right >= 0) {
        return countryCodes[right];
    }
    return "Unknown";
}

// Convert IP string to long
private long ipToLong(String ip) {
    String[] parts = ip.split("\\.");
    return (Long.parseLong(parts[0]) << 24)
         + (Long.parseLong(parts[1]) << 16)
         + (Long.parseLong(parts[2]) << 8)
         + Long.parseLong(parts[3]);
}
```

## Performance Data

- **Memory Usage**: ~300,000 IP ranges, two arrays with ~300K elements each, total about 4 MB
- **Query Latency**: < 10 microseconds per query (~19 comparisons for binary search)
- **QPS**: Easily handles millions of queries per second on a single machine
- **Data Updates**: IP database updates roughly once a month; a scheduled task automatically pulls and reloads

## Other Data Source Comparisons

| Data Source | Granularity | Free Version | Characteristics |
|-------------|-------------|-------------|-----------------|
| IP2Location Lite | Country | Yes | Clean data, uniform format |
| GeoIP2 (MaxMind) | City | Yes (limited) | High community recognition, good Java API |
| Chunzhen IP Database | ISP | Yes | Best accuracy within China |
| ipip.net | City/ISP | No | Most accurate for China, but paid |

If you only need country-level granularity, IP2Location Lite is sufficient. For city-level accuracy, MaxMind GeoLite2 is recommended.

## Deployment

The project is built on Spring Boot and supports two deployment methods:

```bash
# Run directly
mvn spring-boot:run

# Docker
docker run -p 8080:8080 lcy362/ip-country
```

Try it online: [http://ip-country.lichuanyang.top/](http://ip-country.lichuanyang.top/)

Project source: [https://github.com/lcy362/ip-country](https://github.com/lcy362/ip-country)

---
Source: https://lichuanyang.top/en/posts/36780/

---
