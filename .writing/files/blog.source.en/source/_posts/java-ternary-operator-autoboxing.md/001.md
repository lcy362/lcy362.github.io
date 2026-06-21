---
title: 'Java Details: Ternary Operator and Autoboxing'
description: "A problem discovered through FindBugs, analyzing the autoboxing trap and boxing overhead in Java's ternary operator."
keywords:
  - Java
  - ternary operator
  - autoboxing
  - boxing
  - FindBugs
categories:
  - Java
tags:
  - java
abbrlink: 53072
cover: /img/java-details-ternary.jpg
date: 2018-05-10 21:22:36
---
## Problem Introduction

I encountered an interesting problem today while scanning code with FindBugs — it's about the ternary operator. Let me record it here.

<!-- more -->

It's about code like this:

```java 
boolean b = true; 
Long a = b ? 0l : Long.valueOf(2); 
```

FindBugs gave the warning: "Boxed value is unboxed and then immediately reboxed" — meaning a boxed object is unboxed and then immediately reboxed. This problem is actually quite common. I didn't pay much attention to it at first, and just habitually changed `Long.valueOf` to `Long.parseLong`, which did eliminate the warning. But later I realized something was wrong: `valueOf` returns a `Long` type while `parseLong` returns a `long` type, and what we need is actually the `Long` type. So why does using `valueOf` cause a problem while `parseLong` doesn't?

If you think about it, it's actually straightforward. The issue lies in the other branch of the ternary operator — because the other branch returns an unboxed `0`, the return type of this ternary operator becomes `long`, so the original `Long` type must go through an unboxing operation before being returned. To optimize this, just make sure both branches have consistent return types.

Then I looked up the related details and got a clearer understanding.

## Autoboxing/Unboxing

Since JDK 1.5, Java has introduced autoboxing and unboxing, eliminating the need for explicit type conversions and improving our development efficiency. For example:

```java 
        Double dWrap1 = 10d; 

        double d1 = dWrap1; 

        double d2 = d1 + dWrap1; 

        DoubledWarp2 = d2 + dWrap1; 
```

This code can run normally.

Another thing to note is that in an expression involving type conversion — such as the ternary operator mentioned earlier — the compiler will prioritize primitive types, meaning it will first unbox already boxed objects.

Our original problem was just a minor performance overhead:

```java 
Long B = null; 
Long A = (2>1)?B:0l; 
```

But code like this is actually buggy. It looks like we're just assigning a null to a `Long`-typed `A`, but during this process, an unboxing to `long` will occur, which will definitely cause a `NullPointerException`.

Therefore, in our daily development, we should try to avoid unnecessary boxing/unboxing and type conversions. Not only for performance reasons, but also to avoid some strange issues.

Source: https://lichuanyang.top/en/posts/53072/
