---
title: Designing an Open-Source Beijing Subway Route Planner (Java Version)
description: "A Java implementation of a Beijing subway route planning tool that fetches data from the Amap (Gaode) API and calculates routes with the minimum number of stops."
keywords:
  - subway route planning
  - Java
  - Amap
  - algorithm
  - open-source tool
categories:
  - Java
tags:
  - tools
  - open-source-project
abbrlink: 13793
date: 2018-03-23 14:33:52
---
## Overview

I've been looking for an apartment recently, and I wanted to find a location that's relatively convenient to get to several places. Checking the map manually was quite troublesome, so I decided to build a small tool for planning Beijing subway routes. This article briefly introduces the implementation process. The current functionality is relatively simple — the main method takes an input starting station and lists the routes with the minimum number of stops from all other stations to that location.
<!-- more -->

## Data Acquisition

I found the Amap (Gaode Map) API data online: http://map.amap.com/service/subway?_1469083453978&srhdata=1100_drw_beijing.json . I parsed the returned JSON string, which contains information about each subway line, listing each station along the line.

By parsing the data, the main information we need is about each station. The data structure for a station is defined as follows:

```java
    private String id;
    private String name;
    private Set<String> lines = new HashSet<String>(); //所在线路
    private String position;
    private String pinyin;
    private Set<String> nextStations = new HashSet<String>(); //相邻站点
```

After aggregating all stations, the entire network can be treated as a graph. The `nextStations` field is used to represent edge information.

## Route Planning

The route planning algorithm can reference Dijkstra's algorithm. Since the current representation is just an undirected unweighted graph, the implementation is even simpler.

The implementation process is described as follows:

1. Create two maps: `knownPath` and `waitingPath`, representing the list of stations whose shortest paths have been determined and the list of stations pending processing, respectively. During initialization, `knownPath` contains only the specified starting point, `waitingPath` contains all other stations, and the distance is set to infinity (represented by MAX = 20000)
2. Set the starting point as the current node
3. Process each neighboring node of the current node sequentially, updating the shortest distance for each node
4. Find the node with the shortest distance from `waitingPath`, set it as the current node, repeat step 3, and move it from `waitingPath` to `knownPath`

After the entire process completes, you'll get the shortest distance and route details from each node to the starting point, and then you can calculate transfer information for the route details.

For transfer detection, the main logic is: if the previous and next stations of a station are on different lines, we can determine that a transfer occurred at that station. For example, Dengshikou-Dongsi-Chaoyangmen: Dengshikou is on Line 5, Chaoyangmen is on Lines 2 and 6, so we can conclude that a transfer definitely occurred at Dongsi. However, there are some special cases to handle. For instance, Xizhimen to Ping'anli — if the middle station is Chegongzhuang (although no one would actually do this in reality), a transfer actually occurred, but the above logic would incorrectly determine it as no transfer.

The final route information contains the following:

```java
    private String stationId;
    private int length;
    private int transferNum; //换乘数
    private List<String> detail = new ArrayList<>(); //详细路径
```

## Use Cases

The main functionality is already complete, and you can customize processing as needed. For example, if I need to find "locations within 15 stops of Olympic Green Station and within 7 stops of Tian'anmen East Station," I can input Olympic Green and Tian'anmen East separately, then filter and intersect the results accordingly.

## Future Plans

The current implementation is relatively simple, only considering the number of stops. In reality, the distance and travel time between different stations can vary significantly, and the transfer cost at different locations also varies greatly. So in the future, I'll try to find detailed transfer station data and travel time data between stations to apply to the algorithm.

Another thing is to find a suitable method to build a UI, since everything has been purely backend so far, and I haven't decided what would be appropriate yet.

Additionally, I'm considering scraping housing price information.

## Code

https://github.com/lcy362/FoxSubway

Feedback is welcome.

Source: https://lichuanyang.top/en/posts/13793/

---
