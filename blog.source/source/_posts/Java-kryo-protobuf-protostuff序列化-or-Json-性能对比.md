---
title: Java kryo/protobuf/protostuff序列化 or Json 性能对比
description: "对比 Java 主流序列化方案（kryo、protobuf、protostuff、fastjson）的时间性能和空间性能，通过实测数据帮你选择最合适的序列化工具。"
keywords:
  - Java序列化
  - kryo
  - protobuf
  - protostuff
  - fastjson
  - 性能对比
categories:
  - Java
tags:
  - java
  - 序列化， kryo
  - protobuf
  - json
abbrlink: 57802
date: 2017-03-02 18:10:00
---
<div class="markdown_views">
对于一个java object的序列化，想测一下使用json和使用一般序列化工具，在时间性能、空间性能上的区别。

json选择用fastjson.

序列化工具使用了protostuff和kyro. 为什么不用protobuf呢？因为感觉对于一个已有的上百个属性的java class来说，再去新建一个匹配的proto文件有点反人类。protostuff是protobuf的改良版本，可以直接将一个java object进行序列化，使用方法与kyro有点类似，没有protobuf那么多中间过程。其他的，hession, java自带序列化之类的，据说性能比kryo和protobuf差很多，就不测了。

简单测了一下，发现差距还挺明显的，所以感觉也不需要做具体的评测了。把日志截一段发出来，大家感受下。

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
    protostuff deserilise cost <span class="hljs-number">219085</span>
    fastjson serilise cost <span class="hljs-number">804892</span>  <span class="hljs-built_in">length</span>: <span class="hljs-number">1740</span>
    kyro serilise cost <span class="hljs-number">392380</span>   length502
    protostuff serilise cost <span class="hljs-number">220664</span>   length633
    fastjson deserilise cost <span class="hljs-number">243560</span>
    kyro deserilise cost <span class="hljs-number">360010</span>
    protostuff deserilise cost <span class="hljs-number">132241</span>
    fastjson serilise cost <span class="hljs-number">601991</span>  <span class="hljs-built_in">length</span>: <span class="hljs-number">1740</span>
    kyro serilise cost <span class="hljs-number">244349</span>   length502
    protostuff serilise cost <span class="hljs-number">80924</span>   length633
    fastjson deserilise cost <span class="hljs-number">241191</span>
    kyro deserilise cost <span class="hljs-number">230928</span>
    protostuff deserilise cost <span class="hljs-number">127109</span>

cost的时间用的是System.nanoTime(); 三种用的都是不加任何配置的默认配置。 

序列化之后的占用空间，kryo略低于protostuff, 两者都远高于json. 这是很好理解的，毕竟json串是可读的，不要强求太多。 

而序列化和反序列化的耗时，都是protostuff优于kyro优于fastjson, 而且差别挺明显。

所以结论呢，如果对空间没有极其苛刻的要求，protostuff也许是最佳选择。protostuff相比于kyro还有一个额外的好处，就是如果序列化之后，反序列化之前这段时间内，java class增加了字段（这在实际业务中是无法避免的事情），kyro就废了。但是protostuff只要保证新字段添加在类的最后，而且用的是sun系列的JDK, 是可以正常使用的。因此，如果序列化是用在缓存等场景下，序列化对象需要存储很久，也就只能选择protostuff了。

当然，如果有可读性之类的需求，就只能用json了。

</div>

&nbsp;

---
