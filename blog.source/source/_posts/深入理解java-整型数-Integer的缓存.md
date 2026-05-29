---
title: 'java里128有何魔力？ 聊聊Integer的缓存'
description: "揭秘 Java Integer 类在 128 这个魔力数字背后的缓存机制，理解自动装箱的底层原理。"
tags:
  - java
  - java integer
  - javaInteger缓存
abbrlink: 64970
date: 2016-12-02 19:45:00
---


Integer类实质上也是一个普通的java类，即使值相同，也是不同的对象。 

例如

            Integer a = <span class="hljs-number">148</span>;
            Integer b = <span class="hljs-number">148</span>;
            System.out.println(a==b);`</pre>

    这时输出为false. 很容易理解。

    但是如果把值换成128以下的数，比如48.

    <pre class="prettyprint">`        Integer a = <span class="hljs-number">48</span>;
            Integer b = <span class="hljs-number">48</span>;
            System.out.println(a==b);`</pre>

    这时就会发现输出变成了true。原因是jdk对128以下的整数作了缓存，当声明两个值为48的Integer对象时，其实是指向同一位置。

    当然也可以强制声明一个新的Integer对象。

    <pre class="prettyprint">`        Integer a = <span class="hljs-number">48</span>;
            Integer b = <span class="hljs-keyword">new</span> Integer(<span class="hljs-number">48</span>);
            System.out.println(a==b); 

这时输出就变成false了

