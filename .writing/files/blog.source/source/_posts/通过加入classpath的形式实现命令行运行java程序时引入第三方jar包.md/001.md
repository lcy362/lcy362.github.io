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
在命令行运行java程序时，如果想引入第三方jar包该怎么办呢。方法其实有很多，一般都是去折腾classloader.

这里介绍一种操作相对简单的方法，就是在运行之前把需要的jar包都加入到classpath中。

具体来说，就是写一个shell脚本，定义一个参数，可以就叫CLASSPATH, 也可以叫别的。

 CLASSPATH=yourownjar.jar:xxx.jar:/xx/xx/xxx1.jar:"$CLASSPATH" 

需要注意的是，自己写的主类所在的jar也要包含在自己定义的classpath中.

然后使用java -classpath命令运行即可：

java -classpath ${CLASSPATH} xx.Main
---
