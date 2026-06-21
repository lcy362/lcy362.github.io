---
title: "[Translation] Some Experiences Writing Benchmarks in Java"
description: "Translated article: Java benchmark writing experiences, introducing JMH usage and common benchmark pitfalls."
keywords:
  - java
  - benchmark
  - jmh
  - performance testing
  - translation
categories:
  - Java
tags:
  - java
  - testing
abbrlink: 4987
cover: /img/4987.jpg
date: 2017-06-05 20:39:00
---

Sometimes we need to write some simple performance test code. I happened to come across an experience-based post on Stack Overflow: https://stackoverflow.com/questions/504103/how-do-i-write-a-correct-micro-benchmark-in-java — how to write benchmarks to minimize environmental influence.

Here's my translation:

Tips from a Java HotSpot author on writing microbenchmarks:

Rule 0: Read good papers on the JVM and microbenchmarks. For example, https://www.ibm.com/developerworks/java/library/j-jtp02225/. Don't have too high expectations for these kinds of tests; they can only provide limited insight into JVM performance.

Rule 1: Always include a warm-up phase that runs until all initialization and compilation has been triggered. (The number of iterations during warm-up can be reduced; the rule of thumb is tens of thousands of loops.)

Rule 2: Always run with parameters like `-XX:+PrintCompilation -verbose:gc` so you can determine whether compilation phases and other parts of the JVM are doing unexpected work during timing.

Rule 2.1: Print messages at the beginning and end of the timing and warm-up phases, so you can determine whether there's Rule 2 output during timing.

Rule 3: Understand the difference between -client and -server, and between OSR and regular compilation. -server is better than -client, and regular compilation is better than OSR.

Rule 4: Be aware of initialization effects. Don't print results from the first timing run, unless you're testing class loading. Rule 2 is your first line of defense against this effect.

Rule 5: Be aware of compiler optimization and recompilation effects. Don't use any code paths during timing, as the compiler may optimize based on some optimistic assumptions, leading to that path never being used, which allows the compiler to garbage-collect and recompile the code. Rule 2 is your first line of defense against this effect.

Rule 6: Use appropriate tools to observe the compiler's work, and be prepared for it to produce some surprising code. Check the code yourself before forming theories about what makes things faster or slower.

Rule 7: Reduce noise in measurements. Run benchmarks on a quiet machine, run them several times, and discard outliers. Use `-Xbatch` to serialize the compiler with the application, and consider setting `-XX:CICompilerCount=1` to prevent the compiler from running parallel to itself.

Rule 8: Use some libraries designed for benchmarking, as they may be more efficient. For example JMH, Caliper, UCSD Benchmarks for Java, etc.

---

Source: https://lichuanyang.top/en/posts/4987/
