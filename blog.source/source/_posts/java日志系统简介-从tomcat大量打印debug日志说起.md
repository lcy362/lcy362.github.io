---
title: 'java日志系统简介: 从tomcat大量打印debug日志说起'
description: "从 Tomcat debug 日志问题切入，介绍 Java 两大日志体系（log4j 和 slf4j+logback）的架构和互操作。"
keywords:
  - Java日志
  - log4j
  - slf4j
  - logback
  - Tomcat
categories:
  - Java
tags:
  - java
  - 日志
abbrlink: 4433
cover: /img/4433.jpg
date: 2017-03-31 19:47:00
---
Java 的日志框架生态可能是所有编程语言中最复杂的——不是因为它功能多复杂，而是历史原因导致了多套体系的并存和交叉。本文从一个真实的线上排查案例出发，理清 Java 日志框架的体系结构。

<!-- more -->

## Java 日志体系架构

目前 Java 下最主流的两套日志体系是 **Log4j** 和 **SLF4J + Logback**。

### 日志门面 vs 日志实现

理解这个区分是搞懂 Java 日志生态的关键：

| 类型 | 角色 | 例子 |
|------|------|------|
| **日志门面（Facade）** | 只定义接口，不提供具体实现 | SLF4J、Commons Logging（JCL） |
| **日志实现** | 真正的日志写入逻辑 | Logback、Log4j 1.x、Log4j 2、java.util.logging（JUL） |

**SLF4J + Logback** 是典型的门面+实现分离架构：SLF4J 只包含接口（`LoggerFactory`、`Logger`），Logback 是具体实现。分离的好处是代码只依赖 SLF4J 接口，实现可以随时替换。

**Log4j 1.x** 则同时包含接口和实现——代码直接用 `org.apache.log4j.Logger`。

### 桥接器

正是因为有两套体系，才出现了桥接器（Bridge）——让一套体系的接口打出的日志能被另一套体系的实现处理：

```
SLF4J 接口 ──→ slf4j-log4j12 ──→ Log4j 实现    （用 Log4j 输出 SLF4J 日志）
Log4j 接口 ──→ log4j-over-slf4j ──→ SLF4J → Logback  （用 Logback 输出 Log4j 日志）
```

**重要**：`slf4j-log4j12` 和 `log4j-over-slf4j` 方向相反，不能同时使用，否则会造成无限循环。

## 一个真实的排查故事

### 问题现象

部署在 Tomcat 上的一个 Web 应用，磁盘空间持续下降，日志文件异常庞大。我们明明在 war 包里把 Log4j 的日志级别配成了 `INFO`，但 Tomcat 的 `catalina.out` 里却在疯狂打印 `DEBUG` 级别的日志。

### 排查过程

1. 起初以为是 Tomcat 配置问题，花了不少时间调整 Tomcat 日志级别，无果
2. 磁盘告急，只好先 `jstack` 看看哪些线程在跑，发现大量线程阻塞在 **Logback 的写日志代码**上
3. 这个线索完全出乎意料——我们根本没配置 Logback！

### 真相

逐一梳理 war 包的依赖关系后，破案了：

1. 业务代码使用 **SLF4J 接口**写日志
2. war 包里同时存在 **logback-core**、**log4j**、**slf4j-log4j12** 三个包
3. Classpath 中有 Logback 和 Log4j 两个 SLF4J 的实现——SLF4J 会随机（或者说"不确定地"）选择其中一个
4. 这次它选了 **Logback**
5. 我们只配了 Log4j 的配置文件（`log4j.xml`），Logback 找不到配置，按默认行为——**所有级别都输出**
6. 于是磁盘被 DEBUG 日志撑爆了

### 解决方案

把 Logback 相关的 jar 包从 war 包里全部移除。看似粗暴，但这其实是最合理的做法——当你已经确定使用一套日志实现时，就应该清除另一套，避免 SLF4J 的自动绑定逻辑给你"惊喜"。

后来我们用 Maven 的 `dependency:tree` 命令找到了引入 Logback 的间接依赖，加上 `<exclusion>` 一劳永逸。

## 日志问题排查通用套路

下次再遇到类似的日志诡异问题，按这个三步走：

**1. 找到"肇事"日志**

在巨大的日志文件里找几行不符合你配置的日志，用 `grep` 找到具体是哪行代码打印的：

```bash
grep -n "某个独特关键词" catalina.out
```

然后去代码里确认：这个日志是用哪个接口写的？SLF4J 的 `Logger`？还是 Log4j 的 `Logger`？

**2. 查 jar 包依赖树**

```bash
mvn dependency:tree | grep -E "log4j|logback|slf4j|commons-logging|jul"
```

重点关注：有没有**多套日志实现**同时出现在 classpath 中？有没有**桥接器方向搞反**？

**3. 清除多余的实现**

只保留一套日志实现。如果需要兼容旧代码，用桥接器将旧接口路由到新实现：

```xml
<!-- 想用 SLF4J + Logback，把 Log4j 接口也桥接过来 -->
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>log4j-over-slf4j</artifactId>
</dependency>
<!-- 排除原版 log4j，避免冲突 -->
<exclusion>
    <groupId>log4j</groupId>
    <artifactId>log4j</artifactId>
</exclusion>
```

## 2026 年的推荐组合

当前推荐的 Java 日志架构：

- **门面**：SLF4J（事实标准）
- **实现**：Log4j 2（异步性能优于 Logback，且已修复 Log4j 1.x 的安全漏洞）
- **规范**：代码中只使用 `org.slf4j.Logger`，不要直接依赖任何具体日志实现

```xml
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-slf4j2-impl</artifactId>
    <version>2.23.1</version>
</dependency>
```

如果你的项目还是旧的 Log4j 1.x，建议趁早升级——不仅是性能和安全问题，Log4j 1.x 已经 EOL 多年了。
---
