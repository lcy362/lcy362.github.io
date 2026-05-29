---
title: java多线程实现三个字母顺序输出
description: "通过多线程顺序输出 ABC 的经典例子，加深对 Java wait/notify 机制的理解，展示锁策略的设计思路。"
keywords:
  - Java
  - 多线程
  - wait
  - notify
  - 线程同步
categories:
  - Java
tags:
  - java
  - 多线程
abbrlink: 60353
date: 2017-01-25 16:59:00
---
主要还是通过一个例子加深一下对java多线程里wait,notify的理解，因此写了一个例子，三个线程分别输出A,B,C三个字母，控制这三个线程的执行顺序，从而实现ABCABCABC..这样的输出。

这个问题主要还是需要设计一下锁的策略，这里只是提供了一种方式：

每个线程占用两把锁，分别代表自己(self)和前一个线程（prev）, 三个线程的持有锁情况如下表所示：

<table>
<thead>
<tr><th>线程号</th><th>prev锁</th><th>self锁</th></tr>
</thead>
<tbody>
<tr>
<td>A</td>
<td>c</td>
<td>a</td>
</tr>
<tr>
<td>B</td>
<td>a</td>
<td>b</td>
</tr>
<tr>
<td>C</td>
<td>b</td>
<td>c</td>
</tr>
</tbody>
</table>

A 首先启动，持有ac, 运行后先释放a, b可以执行。

线程run方法代码如下：

        <span class="hljs-keyword">public</span> <span class="hljs-keyword">void</span> <span class="hljs-title">run</span>() {
            <span class="hljs-keyword">while</span> (<span class="hljs-keyword">true</span>) {
                <span class="hljs-keyword">synchronized</span> (prev) {
                    <span class="hljs-keyword">synchronized</span> (self) {
                        System.out.print(name);
                        self.notify();
                    }
                    <span class="hljs-keyword">try</span> {
                        <span class="hljs-comment">//如果想控制输出速度， 可以将sleep加在此处</span>
                        <span class="hljs-comment">//如果加在sout之后，会导致c线程启动并占有b锁之后,a线程才会释放a锁，输出顺序会变成acbacb</span>
                        <span class="hljs-comment">//也可以加大三个线程启动的间隔时间解决这一问题</span>
                        <span class="hljs-keyword">try</span> {
                            Thread.sleep(<span class="hljs-number">1000</span>);
                        } <span class="hljs-keyword">catch</span> (InterruptedException e) {
                            e.printStackTrace();
                        }
                        prev.wait();
                    } <span class="hljs-keyword">catch</span> (InterruptedException e) {
                        e.printStackTrace();
                    }
                }

            }

需要注意的是，如果想控制输出速度，需要考虑一下sleep的位置和时间，避免在A线程执行完并释放a锁之前，C线程已经启动并持有了B锁，导致B线程无法正常启动。

---
