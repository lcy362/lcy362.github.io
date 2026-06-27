---
title: 通过加入classpath的形式实现命令行运行java程序时引入第三方jar包
description: "通过 Shell 脚本设置 CLASSPATH，实现命令行运行 Java 程序时引入第三方依赖。"
keywords:
  - Java
  - classpath
  - 命令行
  - 第三方jar
categories:
  - Java
tags:
  - java
abbrlink: 65262
cover: /img/65262.jpg
date: 2017-05-03 18:42:00
---
在命令行直接运行 Java 程序时，如果需要引入第三方 jar 包，通常的做法是用 Maven/Gradle 打一个 fat jar（把依赖全部打包进去）。但在某些轻量场景下——比如写了一个小脚本、做快速原型验证、或者在 CI 环境中临时跑一段 Java 代码——手动设置 classpath 反而更直接。

<!-- more -->

## Classpath 是什么？

Classpath 是 JVM 查找类文件的搜索路径。当你写 `java com.example.Main` 的时候，JVM 会在 classpath 中逐条路径搜索 `com/example/Main.class`。

默认情况下，classpath 只包含当前目录（`.`）。如果程序依赖了其他 jar 包，就需要手动把它们加到 classpath 中。

## 方法一：Shell 脚本拼接

写一个简单的启动脚本，手动拼接所有依赖 jar 的路径：

```bash
#!/bin/bash

# 定义 CLASSPATH
CLASSPATH=your-main.jar:lib/dep1.jar:lib/dep2.jar:"$CLASSPATH"

# 运行
java -classpath "${CLASSPATH}" com.example.Main
```

**几个注意点**：

- **自己的主类所在的 jar 也要包含进去**，这点容易忘
- **Linux/macOS 用 `:` 分隔**，Windows 用 `;`：
  ```bash
  # Linux
  java -classpath "a.jar:b.jar" Main
  
  # Windows
  java -classpath "a.jar;b.jar" Main
  ```
- **路径中有空格要加引号**

## 方法二：通配符批量引入

如果 lib 目录下 jar 很多，一个一个写太麻烦。Java 6 开始支持通配符：

```bash
java -classpath "your-main.jar:lib/*" com.example.Main
```

`lib/*` 会自动匹配 `lib/` 下的所有 `.jar` 文件。**注意**：通配符只匹配 jar，不匹配 class 文件或子目录。

## 方法三：自动生成启动脚本

如果你的项目用 Maven，可以用 `maven-dependency-plugin` 自动生成 classpath：

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-dependency-plugin</artifactId>
    <executions>
        <execution>
            <goals><goal>build-classpath</goal></goals>
            <configuration>
                <outputFile>classpath.txt</outputFile>
            </configuration>
        </execution>
    </executions>
</plugin>
```

然后在脚本里读取：

```bash
CLASSPATH=$(cat target/classpath.txt):target/your-app.jar
java -classpath "${CLASSPATH}" com.example.Main
```

## 什么时候用手动 classpath，什么时候用 Fat Jar？

| 方案 | 适用场景 | 优点 | 缺点 |
|------|---------|------|------|
| 手动 classpath | 快速原型、CI 脚本、小工具 | 简单直接，不需额外构建 | 容易写错路径 |
| Fat Jar（Shade/Assembly） | 生产部署 | 单文件，到处可跑 | 构建慢，文件大 |
| Docker 镜像 | 现代标准部署 | 环境一致性最好 | 需要 Docker 环境 |

如果你只是想在服务器上快速跑一段 Java 代码验证一个想法，手动拼 classpath 是最快的方式。但如果是生产环境，还是用 fat jar 或 Docker 镜像更规范。

另外，如果你需要更复杂的依赖管理，可以参考我之前写的 [Maven Shade Plugin 打可执行 Jar 包](/posts/3945/) 一文。
---
