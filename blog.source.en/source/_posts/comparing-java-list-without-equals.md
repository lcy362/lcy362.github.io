---
title: Comparing Java Lists Without Implementing equals
description: "Use Apache Commons utility methods to compare two Lists' values without modifying the equals method of third-party classes."
keywords:
  - Java
  - List comparison
  - equals
  - Apache Commons
categories:
  - Java
tags:
  - java
abbrlink: 28720
date: 2017-04-10 19:57:00
---
In Java, there are several ways to compare whether two Lists have the same values regardless of order, such as sorting followed by using `equals`, or executing `containsAll` in both directions, etc. All of these methods require us to implement the `equals` and `hashCode` methods for the element classes in the list.

However, there are special cases where it's not convenient for us to implement the `equals` method of a class — for example, when it comes from an ancient third-party JAR package where modifying the code could bring many unknown issues. What should we do in such situations?

Actually, it's quite simple. The all-powerful Apache Commons already thought of this, so they added externally supplied `equals` and `hashCode` methods in `commons-collections4`. Even the `equals` and `hashCode` methods themselves don't need to be written by us — they can be implemented using the `commons-lang` package. The specific code is as follows:

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
Source: https://lichuanyang.top/en/posts/28720/
