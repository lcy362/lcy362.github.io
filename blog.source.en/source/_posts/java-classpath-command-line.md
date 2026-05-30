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
date: 2017-05-03 18:42:00
---
When running a Java program from the command line, how do you include third-party jar packages? There are actually many methods, most of which involve tinkering with the classloader.

Here I'll introduce a relatively simple approach: adding all the required jar packages to the classpath before running.

Specifically, you write a shell script that defines a parameter — you can call it `CLASSPATH` or something else.

 CLASSPATH=yourownjar.jar:xxx.jar:/xx/xx/xxx1.jar:"$CLASSPATH" 

Note that the jar containing your own main class must also be included in the classpath you define.

Then use the `java -classpath` command to run:

java -classpath ${CLASSPATH} xx.Main
Source: https://lichuanyang.top/en/posts/65262/

---
