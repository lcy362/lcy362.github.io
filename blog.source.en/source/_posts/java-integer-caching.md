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
date: 2016-12-02 19:45:00
---
The `Integer` class is essentially just an ordinary Java class — even if the values are the same, they are different objects.

For example:

            Integer a = <span class="hljs-number">148</span>;
            Integer b = <span class="hljs-number">148</span>;
            System.out.println(a==b);`

The output here is `false`. Easy to understand.

However, if you change the value to a number below 128, such as 48:

    <pre class="prettyprint">`        Integer a = <span class="hljs-number">48</span>;
            Integer b = <span class="hljs-number">48</span>;
            System.out.println(a==b);`</pre>

You'll find the output becomes `true`. The reason is that the JDK caches integers below 128. When you declare two `Integer` objects with the value 48, they actually point to the same location in memory.

Of course, you can also explicitly create a new `Integer` object:

    <pre class="prettyprint">`        Integer a = <span class="hljs-number">48</span>;
            Integer b = <span class="hljs-keyword">new</span> Integer(<span class="hljs-number">48</span>);
            System.out.println(a==b); 

The output here becomes `false`.

Source: https://lichuanyang.top/en/posts/64970/
