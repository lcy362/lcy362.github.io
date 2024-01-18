---
title: camel系列之camel debugger的使用
tags:
  - camel
abbrlink: 1120
date: 2017-08-03 19:56:00
---

apache-camel 作为数据路由的利器，使用起来非常方便。不过与此同时，也有一个问题，就是由于封装的过于完善，隐藏了很多技术细节，所以一旦有问题，排查会比较困难。好在官方提供了一个debug工具，可以帮助我们正常的打断点、调试，http://camel.apache.org/debugger.html， 在本文中会对官方文档做一些补充。

首先需要引入camel-test包：
```xml
        <dependency>
            <groupId>org.apache.camel</groupId>
            <artifactId>camel-test</artifactId>
            <version>2.16.2</version>
        </dependency>
```
之后新建一个类并实现CamelTestSupport 。
```java
public class CamelDebugger extends CamelTestSupport {
```
CamelTestSupport 中有大量的方法，可以根据需要选择一些进行实现，介绍一下其中一些比较重要的。

1\. createCamelContext() 这个方法可以定义自己的camelContext进行测试.

2\. createRouteBuilder() 这个方法则是使用默认的camelContext，但是加入自己的route

3\. debugBefore 和 debugAfter, 这两个方法分别在一条消息被处理前后被执行， 参数里包括exchange, processor等必要信息。真正debug时，也就是在这两个方法里写日志或者打断点。

具体例子代码可以查看： https://github.com/lcy362/CamelDemo/blob/7aef2cc7661236499896022f6976c160b73b68e7/src/main/java/com/mallow/demo/camel/debugger/CamelDebugger.java