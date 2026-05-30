---
title: Building Executable JAR Packages with Maven Shade Plugin
description: "Build executable Fat JARs with Maven Shade Plugin as an alternative to Eclipse's Export feature, specifying the Main class for one-click execution."
keywords:
  - Maven
  - shade plugin
  - Fat Jar
  - packaging
categories:
  - Java
tags:
  - java
  - maven
abbrlink: 3945
date: 2017-05-14 09:32:00
---
Eclipse has a feature called "Export Runnable JAR File" that packages a project along with all its dependencies into a Fat JAR, with a specified Main class, so you can run the code directly using `java jar xxx.jar`.

<!-- more -->

However, what if you're not using Eclipse? Actually, with the help of Maven, we can easily achieve the same functionality. Maven provides a Shade Plugin that can be used to build Fat JARs, and it also supports specifying the Main class.

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

Then when you build with Maven, it will produce a directly runnable package.

Source: https://lichuanyang.top/en/posts/3945/
