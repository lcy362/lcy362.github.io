---
title: 'java细节:三目运算符和自动拆箱'
description: "通过 FindBugs 发现的问题，深入分析 Java 三目运算符中的自动拆箱陷阱和装箱开销。"
keywords:
  - Java
  - 三目运算符
  - 自动拆箱
  - 装箱
  - FindBugs
categories:
  - Java
tags:
  - java
abbrlink: 53072
cover: /img/java-details-ternary.png.jpg
date: 2018-05-10 21:22:36
---
## 问题引入 

今天用findbugs扫代码时遇到一个很有意思的问题，有关三目运算符的，在这儿记录一下。

<!-- more -->

就是类似这么一行代码:

```java 
boolean b = true; 
Long a = b ? 0l : Long.valueOf(2); 
```

Findbugs给出了"Boxed value is unboxed and then immediately reboxed"的提示，意思就是有装箱的对象做了拆箱，然后又马上做了装箱。这个问题其实很常见，一开始也没注意，只是习惯性的把Long.valueOf 改成了Long.parseLong, 确实把这个警告消掉了，不过之后才意识到不对：明明valueOf返回的是Long类型，parseLong返回的是long类型，而需要的正是Long类型，为什么反而用valueOf的时候有问题呢。 

其实思考一下大概也能想明白，主要就在三元运算符的另一个分支，因为另一个分支返回的是一个未装箱的0,所以这个三元运算符的返回值就成了long,所以原本的Long类型就要经过一次拆箱才会被返回。要优化这个部分的话，保持两个分支的返回类型一致就可以了。 

然后把相关的细节查了一下，了解清楚。 

## 自动装箱/拆箱 

从JDK1.5开始，java引入了自动装箱和拆箱，不需要做显式转换，提高了我们的开发效率。比如: 

```java 
        Double dWrap1 = 10d; 

        double d1 = dWrap1; 

        double d2 = d1 + dWrap1; 

        DoubledWarp2 = d2 + dWrap1; 
```

这么一段代码就是可以正常运行的。 

另外一个要注意的地方就是，在一个运算，比如前边提到的三元运算符，涉及到类型转换时，编译器会优先选择基本类型，也就是说会优先把已装箱的对象拆箱。 

我们一开始的问题只是很细微的性能损耗 

```java 
Long B = null; 
Long A = (2>1)?B:0l; 
```

但是像这样的代码的话就是有bug了， 看似只是把一个null赋给Long类型的A, 但是这过程中会做一次向long的拆箱，所以肯定会报空指针。

所以说，我们在平常的开发中，还是应该尽量避免无意义的装/拆箱和类型转换，不光是出于性能考虑，也是为了避免一些诡异的问题。

原文地址: https://lichuanyang.top/posts/53072/

---
