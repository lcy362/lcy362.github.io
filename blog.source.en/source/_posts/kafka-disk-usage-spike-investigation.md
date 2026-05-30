---
title: "Investigating a Kafka Disk Usage Spike: Data Compression, Batch Sending, and More"
description: "An investigation into a Kafka disk space usage spike, diving into Kafka's data compression mechanism and batch sending strategies."
keywords:
  - Kafka
  - Disk Space
  - Data Compression
  - Batch Sending
  - Investigation
categories:
  - Message Queue
tags:
  - kafka
  - growth
abbrlink: 40931
date: 2016-12-29 17:21:00
---
## The Problem

Our company needs to receive a large amount of external data from various sources, including IBM MQ, ActiveMQ, Redis pub/sub, and more. To funnel all this data into our internal AMQ/Kafka, we previously ran a large number of separate processes, which were quite complex to manage. Recently, we consolidated these processes using Apache Camel.

A few hours after deployment, Kafka disk space alerts started firing. We initially determined that this was caused by the new deployment.

## Investigation Process

Since I wasn't very familiar with Kafka — I only knew how to use it — the investigation took some detours.

Because Camel's documentation is quite incomplete, I initially relied on reading source code and guessing when configuring parameters. So I first suspected that the compression parameter `compressionCodec=gzip` wasn't working.

I conducted a simple test (don't ask why I didn't test from the beginning). I created a single-partition test topic, then sent identical data using both gzip and none compression modes, observing the change in Kafka log file sizes. The compression was indeed effective.

I then compared it with using the Kafka API directly and found a significant difference — even with compression enabled, Camel-Kafka consumed several times more space than using the API. I examined the source code on both sides and found the lowest-level code was identical, so I suspected some parameter was misconfigured.

Then I noticed a detail: with Camel, the log size was linearly proportional to the message count — e.g., one message took 1 byte, ten messages took 10 bytes. But with the API, one message took 1 byte, and sending ten messages consecutively might only take about 2 bytes.

This raised the suspicion that Kafka might have a batch sending mechanism. After consulting a colleague responsible for Kafka, this turned out to be exactly the cause. The key difference was whether synchronous sending was used — with synchronous sending, there's no batching. With batch sending, messages in a batch are compressed together, while with individual sending, each message is compressed separately. As we know, gzip compression is very ineffective on very small files and can even produce output larger than the input. After further testing, I confirmed this was the issue. This parameter was wrapped inside Kafka's client interface by a colleague, which caused me to miss it when modifying parameters based on existing code.

## Reflections

Looking back, this problem was quite basic. With a better understanding of Kafka, it could have been avoided.

First, I hadn't done a comprehensive study of Kafka — I only learned how to use it and had a rough idea of what it was, without understanding many of its fundamental mechanisms. When using an open-source tool, it's important to do a thorough study of it. While it's not realistic to deeply study the source code of every tool, a systematic overview of the mechanisms these tools offer doesn't take much time.

Second, companies typically wrap various component access tools for efficiency. It's best to also understand how these wrappers are implemented, otherwise you might unknowingly fall into a trap.

There's still a long way to go.

Source: https://lichuanyang.top/en/posts/40931/
