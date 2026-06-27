---
title: 'The Magic of 128 in Java: Understanding Integer Caching'
description: "Unveiling the caching mechanism behind the magical number 128 in Java's Integer class, understanding the underlying principles of autoboxing."
keywords:
  - Java
  - integer caching
  - autoboxing
  - valueOf
categories:
  - Java
tags:
  - java
  - java-integer
  - java-integer caching
abbrlink: 64970
cover: /img/64970.jpg
date: 2016-12-02 19:45:00
---
Java's `Integer` caching mechanism is a frequently asked interview topic and a common source of pitfalls in daily development. To understand it, let's start with a counterintuitive experiment.

<!-- more -->

## The Curious Case of 128

```java
Integer a = 148;
Integer b = 148;
System.out.println(a == b);  // false — as expected, two different objects

Integer c = 48;
Integer d = 48;
System.out.println(c == d);  // true — wait, why?
```

The same `==` comparison returns false for 148 but true for 48. The reason lies in **Integer caching**.

## IntegerCache Source Code Analysis

When Java compiles `Integer a = 48`, what actually executes is:

```java
Integer a = Integer.valueOf(48);
```

Let's look at the source of `Integer.valueOf()` (JDK 8):

```java
public static Integer valueOf(int i) {
    if (i >= IntegerCache.low && i <= IntegerCache.high)
        return IntegerCache.cache[i + (-IntegerCache.low)];
    return new Integer(i);
}
```

The core logic: if the parameter value falls within the cache range (default -128 to 127), it returns the same instance from the cache array; values outside the range trigger `new Integer(i)`.

This is why `48` (within the cache range) returns `true` for `==`, while `148` (outside the range) creates a new object each time and returns `false`.

`IntegerCache` is a private static inner class:

```java
private static class IntegerCache {
    static final int low = -128;
    static final int high;
    static final Integer cache[];

    static {
        // high can be configured via a JVM parameter
        int h = 127;
        String integerCacheHighPropValue =
            sun.misc.VM.getSavedProperty("java.lang.Integer.IntegerCache.high");
        if (integerCacheHighPropValue != null) {
            h = Math.min(Integer.parseInt(integerCacheHighPropValue), Integer.MAX_VALUE - 129);
        }
        high = h;

        cache = new Integer[(high - low) + 1];
        int j = low;
        for (int k = 0; k < cache.length; k++)
            cache[k] = new Integer(j++);
    }
}
```

**You can adjust the cache upper bound via a JVM parameter**:

```bash
java -Djava.lang.Integer.IntegerCache.high=500 MyApp
```

## Caching in Other Wrapper Classes

| Wrapper Class | Cache Range | Notes |
|---------------|-------------|-------|
| `Boolean` | `TRUE` / `FALSE` | Only two values |
| `Byte` | -128 ~ 127 | Entire range cached |
| `Short` | -128 ~ 127 | Same as Integer |
| `Long` | -128 ~ 127 | Same as Integer |
| `Character` | 0 ~ 127 | ASCII range |
| `Float` | **None** | Caching makes little sense for floating-point |
| `Double` | **None** | Same as Float |

## Three Common Pitfall Scenarios

### 1. HashMap Keys

```java
Map<Integer, String> map = new HashMap<>();
map.put(128, "hello");
map.get(128);  // "hello" — even though == differs, equals still matches, so HashMap works fine
```

HashMap uses `equals()` and `hashCode()`, unaffected by `==`. But if you use `IdentityHashMap`, the cache boundary becomes an invisible source of bugs.

### 2. Integer Comparisons in for Loops

```java
// ❌ Bad practice
for (Integer i = 0; i < 200; i++) {
    // i == some Integer ... may cause issues
}

// ✅ Good practice
for (int i = 0; i < 200; i++) {
    // Use primitive types — clean and reliable
}
```

### 3. Lock Objects

```java
// ❌ Dangerous! Values below 128 return the same object each time,
// meaning you're using the same lock
synchronized (Integer.valueOf(10)) {
    // If you don't know about caching, you might think this is a fresh lock each time
}
```

## Why Is the Cache Range -128 to 127?

This is the signed byte range. Statistically, this interval covers the most commonly used integer values in everyday programming (loop counters, array indices, small constants, etc.). The *Java Language Specification* §5.1.7 explicitly mandates this behavior — it's not an implementation detail; it's guaranteed by the specification.

## Best Practices

1. **Always use `equals()` when comparing Integer values**, not `==`
2. **Use `int` instead of `Integer` wherever possible** — primitive types have no caching traps and offer better performance
3. **Never use Integer objects as lock objects**
---
