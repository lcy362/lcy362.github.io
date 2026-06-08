---
title: storm ui 中一些关键属性的含义
description: "Storm UI 中关键监控指标的含义解读，帮助运维人员快速定位 topology 性能瓶颈。"
keywords:
  - Storm
  - UI
  - 监控指标
  - 性能调优
categories:
  - 大数据
tags:
  - storm
abbrlink: 62259
cover: /img/62259.png
date: 2015-11-06 21:44:00
---
<span style="font-family: FangSong_GB2312; font-size: 14px;">Storm UI对于排查storm使用过程中遇到的问题会很有帮助，但是有些属性的含义不是很明确，虽然都是很简单的概念，如果不知道的话也会很难受。</span>

<span style="font-family: FangSong_GB2312; font-size: 14px;">先说一点，鼠标只到UI上的标题栏时，是可以看到这一属性的具体属性的，几篇google rank很高的文章，其实就是把这个信息整理了下来。</span>

<span style="font-family: FangSong_GB2312; font-size: 14px;">其实大部分属性都是很直白的，看到名字就知道是什么意思，我在这儿之把一些可能造成困扰的属性列一下，方便大家查问题。</span>

&nbsp;

<div style="orphans: 2; word-wrap: break-word;"><span style="font-family: FangSong_GB2312; font-size: 14px;">emitted和transfered: emitted，就是发射出的数据条数，也就是调用OutputCollector的emit方法的次数。transferred则是实际tuple发送到下一个task的数目。乍一看是一样的对吗。其实一般情况下也确实是一样的。但是，比如，一个bolt 发射了数据，但是下游并没有其他bolt取这个数，这个bolt的transfer数就会是0\. 又比如，<span style="orphans: 2;">如果一个bolt A使用all group的方式(每一个bolt都要接收到)向bolt B发射tuple，那么transfered就会是emitted的数倍。</span></span></div>
<div style="orphans: 2; word-wrap: break-word;"><span style="orphans: 2;"><span style="font-family: FangSong_GB2312; font-size: 14px;"><span style="orphans: 2;">excute latency和process latency : excute latency 很直白，就是代码里excute()这个方法的执行时间, 而process latency则是excute方法执行，直到调用ack方法的时间，可以认为是业务代码执行所需的时间，正常情况下，<span style="orphans: 2;">excute latency是会大于<span style="orphans: 2;">process latency的，但是如果你一直不去ack,process latency会远远大于excute latency。</span></span></span>

</span></span></div>
<div style="orphans: 2; word-wrap: break-word;"><span style="orphans: 2;"><span style="orphans: 2;"><span style="font-family: FangSong_GB2312; font-size: 14px;"><span style="orphans: 2;"><span style="orphans: 2;"><span style="color: #333333; line-height: 26px;">spout的complete
 latency: 这个可以参考storm的[ack机制](http://xumingming.sinaapp.com/127/twitter-storm%E5%A6%82%E4%BD%95%E4%BF%9D%E8%AF%81%E6%B6%88%E6%81%AF%E4%B8%8D%E4%B8%A2%E5%A4%B1/)&nbsp;，这个时间就是一个tuple从被发射到这个tuple被ack所需的时间，确切的说，是从spout调用emit方法到调用ack方法的时间差，其实也就是这个由这个tuple生成的tuple树被完全处理所需的时间。</span>

</span></span></span></span></span></div>

&nbsp;
---
