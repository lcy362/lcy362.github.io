---
title: 'java里128有何魔力？ 聊聊Integer的缓存'
description: "揭秘 Java Integer 类在 128 这个魔力数字背后的缓存机制，理解自动装箱的底层原理。"
keywords:
  - Java
  - Integer缓存
  - 自动装箱
  - valueOf
categories:
  - Java
tags:
  - java
  - java integer
  - javaInteger缓存
abbrlink: 64970
cover: /img/64970.jpg
date: 2016-12-02 19:45:00
---
Java 的 `Integer` 缓存机制是一个高频面试题，也是日常开发中容易踩坑的地方。理解它，首先从一个看起来违反直觉的实验开始。

<!-- more -->

## 诡异的 128

```java
Integer a = 148;
Integer b = 148;
System.out.println(a == b);  // false —— 符合预期，两个不同对象

Integer c = 48;
Integer d = 48;
System.out.println(c == d);  // true —— 等等，为什么？
```

同一个 `==` 比较，148 返回 false，48 返回 true。原因就在于 **Integer 缓存**。

## IntegerCache 源码分析

当 Java 编译 `Integer a = 48` 时，实际上执行的是：

```java
Integer a = Integer.valueOf(48);
```

来看 `Integer.valueOf()` 的源码（JDK 8）：

```java
public static Integer valueOf(int i) {
    if (i >= IntegerCache.low && i <= IntegerCache.high)
        return IntegerCache.cache[i + (-IntegerCache.low)];
    return new Integer(i);
}
```

核心逻辑：如果参数值在缓存范围内（默认 -128 ~ 127），直接从缓存数组中返回同一个对象；超出范围才 `new Integer(i)`。

这就是为什么 `48` 在缓存范围内所以 `==` 为 true，而 `148` 超出范围每次 `new`，所以 `==` 为 false。

`IntegerCache` 是一个私有的静态内部类：

```java
private static class IntegerCache {
    static final int low = -128;
    static final int high;
    static final Integer cache[];

    static {
        // high 可以通过 JVM 参数配置
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

**你可以通过 JVM 参数调整缓存上限**：

```bash
java -Djava.lang.Integer.IntegerCache.high=500 MyApp
```

## 其他包装类的缓存

| 包装类 | 缓存范围 | 备注 |
|--------|---------|------|
| `Boolean` | `TRUE` / `FALSE` | 只有两个值 |
| `Byte` | -128 ~ 127 | 全部缓存 |
| `Short` | -128 ~ 127 | 同 Integer |
| `Long` | -128 ~ 127 | 同 Integer |
| `Character` | 0 ~ 127 | ASCII 范围 |
| `Float` | **无** | 浮点数缓存意义不大 |
| `Double` | **无** | 同 Float |

## 三个常见踩坑场景

### 1. HashMap 的 Key

```java
Map<Integer, String> map = new HashMap<>();
map.put(128, "hello");
map.get(128);  // "hello" —— 即使 == 不等，equals 依然相等，所以 HashMap 正常工作
```

HashMap 用 `equals()` 和 `hashCode()`，不受 `==` 影响。但如果你用了 `IdentityHashMap`，缓存边界就成了一个隐形的 bug 来源。

### 2. for 循环中的 Integer 比较

```java
// ❌ 写法
for (Integer i = 0; i < 200; i++) {
    // i == 某个 Integer 时……可能出问题
}

// ✅ 写法
for (int i = 0; i < 200; i++) {
    // 用基本类型，干净利落
}
```

### 3. 锁对象

```java
// ❌ 危险！128 以下的值每次返回同一个对象，等于用的是同一个锁
synchronized (Integer.valueOf(10)) {
    // 如果你不知道缓存机制，可能以为每次都是新锁
}
```

## 为什么缓存范围是 -128 ~ 127？

这是一个字节的有符号表示范围。统计上，这个区间覆盖了日常编程中最常使用的整数值（循环计数器、数组索引、小常量等）。《Java Language Specification》§5.1.7 明确规定了这个行为——这不是实现细节，是有规范保障的。

## 最佳实践

1. **比较 Integer 值时始终用 `equals()`**，不要用 `!=`
2. **能用 `int` 的地方不要用 `Integer`**——基本类型没有缓存陷阱，性能也更好
3. **永远不要用 Integer 做锁对象**

---
