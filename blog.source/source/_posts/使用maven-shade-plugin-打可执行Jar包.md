---
title: 使用maven shade plugin 打可执行Jar包
description: "使用 Maven Shade Plugin 打可执行 Fat Jar，替代 Eclipse 的 Export 功能，指定 Main 方法一键运行。"
keywords:
  - Maven
  - shade plugin
  - Fat Jar
  - 打包
categories:
  - Java
tags:
  - java
  - maven
abbrlink: 3945
cover: /img/3945.png
date: 2017-05-14 09:32:00
---
eclipse里有一个功能叫做“打可执行(runnable) jar包”, 用这个功能可以把一个工程自身和所有依赖包打成一个fat jar，并且指定Main方法，这样直接使用java jar xxx.jar就可以运行代码了。

但是在不使用eclipse的时候呢？其实，借助maven，我们很容易实现同样功能。maven提供了一个shade plugin,可以用来打fat jar, 同时也提供了指定main方法的功能。

```xml
<project>
  ...
  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-shade-plugin</artifactId>
        <version>3.0.0</version>
        <executions>
          <execution>
            <phase>package</phase>
            <goals>
              <goal>shade</goal>
            </goals>
            <configuration>
              <transformers>
                <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                  <mainClass>org.sonatype.haven.HavenCli</mainClass>
                </transformer>
              </transformers>
            </configuration>
          </execution>
        </executions>
      </plugin>
    </plugins>
  </build>
  ...
</project>
```

然后在用maven打包的时候就可以打出直接可运行的包了。
---
