---
title: 不实现equals方法的情况下比较java list
description: "在不修改第三方类的 equals 方法前提下，利用 Apache Commons 的工具方法比较两个 List 的值。"
keywords:
  - Java
  - List比较
  - equals
  - Apache Commons
categories:
  - Java
tags:
  - java
abbrlink: 28720
cover: /img/28720.png
date: 2017-04-10 19:57:00
---
java里比较两个list的值是否一致，不考虑顺序，有多种方法，比如排序后直接用equals比较，相互之间执行两次containsAll等，这些办法都需要我们给list的元素类实现equals和hashcode方法。但是有一种特殊情况，如果我们并不方便去实习类的equals方法，例如是一个古老的第三方jar包，改代码会带来很多未知问题，这时候该怎么办呢。

其实很简单，万能的apache-commons早就想到了这一点，所以在commons-collections4中增加了外部输入equals和hashcode的方法，甚至equals和hashcode方法本身也不需要我们自己写代码，可以用comons-lang包实现，具体代码如下

```
        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-collections4</artifactId>
            <version>4.1</version>
        </dependency>
        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-lang3</artifactId>
            <version>3.5</version>
        </dependency>

```

```
    public static <T> boolean isEqualCollection(Collection<T> l1, Collection<T> l2, final String... exludedFields) {
        Equator<T> equator = generateEquator(exludedFields);
        return CollectionUtils.isEqualCollection(l1, l2, equator);
    }

    private static  <T> Equator<T> generateEquator(final String... exludedFields) {
        Equator<T> equator = new Equator<T>() {
            @Override
            public boolean equate(T o1, T o2) {
                if (o1 == null && o2 == null) {
                    return true;
                }
                if (o1 == null || o2 == null) {
                    return false;
                }
                if (o1.getClass() != o2.getClass()) {
                    return false;
                }
                return EqualsBuilder.reflectionEquals(o1, o2, exludedFields);
            }

            @Override
            public int hash(T o) {
                return HashCodeBuilder.reflectionHashCode(o, exludedFields);
            }
        };
        return equator;
    }

```
---
