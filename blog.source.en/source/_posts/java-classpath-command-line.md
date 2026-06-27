---
title: Running Java Programs from the Command Line by Adding Third-Party Jars to the Classpath
description: "Setting up CLASSPATH via a shell script to include third-party dependencies when running Java programs from the command line."
keywords:
  - Java
  - classpath
  - command line
  - third-party jar
categories:
  - Java
tags:
  - java
abbrlink: 65262
cover: /img/65262.jpg
date: 2017-05-03 18:42:00
---
When running a Java program directly from the command line, if you need to include third-party jar packages, the common approach is to use Maven/Gradle to build a fat jar (bundling all dependencies). However, in lightweight scenarios — such as writing a small script, doing quick prototype validation, or temporarily running Java code in a CI environment — manually setting the classpath is often more straightforward.

<!-- more -->

## What Is Classpath?

Classpath is the search path the JVM uses to locate class files. When you run `java com.example.Main`, the JVM searches each entry in the classpath for `com/example/Main.class`.

By default, the classpath only includes the current directory (`.`). If your program depends on other jar files, you need to add them to the classpath manually.

## Method 1: Shell Script Concatenation

Write a simple startup script that manually concatenates the paths of all dependency jars:

```bash
#!/bin/bash

# Define CLASSPATH
CLASSPATH=your-main.jar:lib/dep1.jar:lib/dep2.jar:"$CLASSPATH"

# Run
java -classpath "${CLASSPATH}" com.example.Main
```

**A few things to note**:

- **Your own main class's jar must also be included** — this is easy to forget
- **Linux/macOS use `:` as the separator**, Windows uses `;`:
  ```bash
  # Linux
  java -classpath "a.jar:b.jar" Main
  
  # Windows
  java -classpath "a.jar;b.jar" Main
  ```
- **Quote paths that contain spaces**

## Method 2: Wildcard Batch Inclusion

If you have many jars in a `lib` directory, listing them one by one is tedious. Java 6+ supports wildcards:

```bash
java -classpath "your-main.jar:lib/*" com.example.Main
```

`lib/*` automatically matches all `.jar` files under `lib/`. **Note**: the wildcard only matches jars, not class files or subdirectories.

## Method 3: Auto-Generate a Startup Script

If you use Maven, you can use the `maven-dependency-plugin` to auto-generate the classpath:

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

Then read it in your script:

```bash
CLASSPATH=$(cat target/classpath.txt):target/your-app.jar
java -classpath "${CLASSPATH}" com.example.Main
```

## When to Use Manual Classpath vs. Fat Jar?

| Approach | Use Case | Pros | Cons |
|----------|----------|------|------|
| Manual classpath | Quick prototyping, CI scripts, small tools | Simple, no extra build step | Easy to get paths wrong |
| Fat Jar (Shade/Assembly) | Production deployment | Single file, runs anywhere | Slow build, large file |
| Docker image | Modern standard deployment | Best environment consistency | Requires Docker |

If you just want to quickly run some Java code on a server to validate an idea, manually putting together the classpath is the fastest way. But for production environments, use a fat jar or Docker image for a more standardized approach.

Additionally, if you need more sophisticated dependency management, check out my earlier post on [building executable jars with Maven Shade Plugin](/posts/3945/).
---
