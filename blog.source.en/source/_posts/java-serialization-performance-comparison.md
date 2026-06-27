---
title: "Java Serialization Performance Comparison: kryo/protobuf/protostuff vs Json"
description: "Comparing the time and space performance of mainstream Java serialization solutions (kryo, protobuf, protostuff, fastjson) with real benchmark data to help you choose the most suitable serialization tool."
keywords:
  - Java serialization
  - kryo
  - protobuf
  - protostuff
  - fastjson
  - performance comparison
categories:
  - Java
tags:
  - java
  - serialization
  - kryo
  - protobuf
  - json
abbrlink: 57802
cover: /img/57802.jpg
date: 2017-03-02 18:10:00
---
<div class="markdown_views">

## Why Compare Serialization Solutions

For serializing a Java object, I wanted to test the differences in time and space performance between using JSON and using general-purpose serialization tools.

For JSON, I chose fastjson.

For serialization tools, I used protostuff and kryo. Why not protobuf? Because for an existing Java class with hundreds of properties, creating a matching proto file feels somewhat inhumane. Protostuff is an improved version of protobuf — it can directly serialize a Java object, and the usage is somewhat similar to kryo, without so many intermediate steps as protobuf. As for others like Hessian and Java's built-in serialization, it's said that their performance is much worse than kryo and protobuf, so I didn't bother testing them.

## Time Performance Comparison

After a quick test, I found the performance gap was quite obvious, so I felt there was no need for a detailed evaluation. Let me share a snippet of the log so you can get a feel for it.

    fastjson serilise cost <span class="hljs-number">555805</span>  <span class="hljs-built_in">length</span>: <span class="hljs-number">1740</span>
    kyro serilise cost <span class="hljs-number">227375</span>   length502
    protostuff serilise cost <span class="hljs-number">78950</span>   length633
    fastjson deserilise cost <span class="hljs-number">130662</span>
    kyro deserilise cost <span class="hljs-number">201716</span>
    protostuff deserilise cost <span class="hljs-number">230533</span>
    fastjson serilise cost <span class="hljs-number">727915</span>  <span class="hljs-built_in">length</span>: <span class="hljs-number">1740</span>
    kyro serilise cost <span class="hljs-number">378958</span>   length502
    protostuff serilise cost <span class="hljs-number">94739</span>   length633
    fastjson deserilise cost <span class="hljs-number">154346</span>
    kyro deserilise cost <span class="hljs-number">373432</span>
    protostuff deserilise cost <span class="hljs_number">219085</span>
    fastjson serilise cost <span class="hljs-number">804892</span>  <span class="hljs-built_in">length</span>: <span class="hljs-number">1740</span>
    kyro serilise cost <span class="hljs-number">392380</span>   length502
    protostuff serilise cost <span class="hljs-number">220664</span>   length633
    fastjson deserilise cost <span class="hljs-number">243560</span>
    kyro deserilise cost <span class="hljs-number">360010</span>
    protostuff deserilise cost <span class="hljs_number">132241</span>
    fastjson serilise cost <span class="hljs-number">601991</span>  <span class="hljs-built_in">length</span>: <span class="hljs-number">1740</span>
    kyro serilise cost <span class="hljs-number">244349</span>   length502
    protostuff serilise cost <span class="hljs-number">80924</span>   length633
    fastjson deserilise cost <span class="hljs_number">241191</span>
    kyro deserilise cost <span class="hljs_number">230928</span>
    protostuff deserilise cost <span class="hljs_number">127109</span>

The cost was measured using `System.nanoTime()`. All three were tested with their default configurations without any additional settings.

## Space Performance Comparison

In terms of serialized output size, kryo is slightly smaller than protostuff, and both are significantly smaller than JSON. This is easy to understand — after all, JSON strings are human-readable, so you can't expect too much from them.

As for serialization and deserialization time, protostuff outperforms kryo, which in turn outperforms fastjson, and the differences are quite significant.

## Serialization Solution Recommendations

So the conclusion is: if you don't have extremely stringent requirements on space, protostuff might be the best choice. Compared to kryo, protostuff has an additional advantage: if the Java class gains new fields during the time between serialization and deserialization (which is unavoidable in real-world business), kryo becomes useless. However, protostuff can still work normally as long as new fields are added at the end of the class and you're using a Sun-based JDK. Therefore, if serialization is used in scenarios like caching where objects need to be stored for a long time, protostuff is really the only viable option.

Of course, if you have requirements for readability or similar needs, JSON is the way to go.

</div>

&nbsp;

Source: https://lichuanyang.top/en/posts/57802/
