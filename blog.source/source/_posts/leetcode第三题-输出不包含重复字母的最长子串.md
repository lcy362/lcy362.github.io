---
title: 'leetcode第三题: 输出不包含重复字母的最长子串'
description: "LeetCode 第三题详解：滑动窗口法求解不含重复字符的最长子串长度。"
keywords:
  - LeetCode
  - 滑动窗口
  - 最长子串
  - 算法
  - 字符串
categories:
  - 算法
tags:
  - 算法
  - leetcode
abbrlink: 43423
tldr: "使用滑动窗口法以 O(n) 时间复杂度解决不含重复字符的最长子串问题，通过记录字符上次出现位置实现一次遍历。"
cover: /img/43423.jpg
date: 2017-02-15 20:34:00
---
## 题目

Given a string, find the length of the longest substring without repeating characters.

Examples:

Given &ldquo;abcabcbb&rdquo;, the answer is &ldquo;abc&rdquo;, which the length is 3.

Given &ldquo;bbbbb&rdquo;, the answer is &ldquo;b&rdquo;, with the length of 1.

Given &ldquo;pwwkew&rdquo;, the answer is &ldquo;wke&rdquo;, with the length of 3\. Note that the answer must be a substring, &ldquo;pwke&rdquo; is a subsequence and not a substring.

也就是说给定一个字符串，输出不包含重复字母的最长子串长度。

## 思路

遍历一次字符串，O(n)复杂度下可以解决。主要思路就是在遍历的过程中 

1\. 记录每个字母上一次出现的位置 

2\.  维持一个从当前位置往前数不包含重复字母的子串，记录这个字串的起止位置start, end

遍历的过程中就是根据相应位置字母是否出现过，以及上次出现的位置，不断更新start, end的过程。

## 代码

可以到github上查看: [https://github.com/lcy362/Algorithms/tree/master/src/main/java/com/mallow/algorithm](https://github.com/lcy362/Algorithms/tree/master/src/main/java/com/mallow/algorithm)

    <span class="hljs-keyword">import</span> java.util.HashMap;

    <span class="hljs-javadoc">/**
     * leetcode 3
     * https://leetcode.com/problems/longest-substring-without-repeating-characters/
     * Created by lcy on 2017/2/15.
     */</span>
    <span class="hljs-keyword">public</span> <span class="hljs-class"><span class="hljs-keyword">class</span> <span class="hljs-title">LongestSubstringNotRepeat</span> {</span>
        <span class="hljs-keyword">public</span> <span class="hljs-keyword">int</span> <span class="hljs-title">lengthOfLongestSubstring</span>(String s) {
            <span class="hljs-keyword">if</span> (s.length() &lt;= <span class="hljs-number">1</span>) {
                <span class="hljs-keyword">return</span> s.length();
            }
            HashMap&lt;Character, Integer&gt; charPos = <span class="hljs-keyword">new</span> HashMap&lt;&gt;();
            <span class="hljs-keyword">char</span>[] chars = s.toCharArray();
            <span class="hljs-keyword">int</span> len = <span class="hljs-number">0</span>;
            <span class="hljs-keyword">int</span> max = <span class="hljs-number">0</span>;
            <span class="hljs-keyword">int</span> start = <span class="hljs-number">0</span>;
            <span class="hljs-keyword">int</span> end = <span class="hljs-number">0</span>;
            <span class="hljs-keyword">for</span> (<span class="hljs-keyword">int</span> i = <span class="hljs-number">0</span>; i &lt; chars.length; i++) {
                <span class="hljs-keyword">if</span> (charPos.containsKey(chars[i])) {
                    <span class="hljs-keyword">int</span> tempstart = charPos.get(chars[i]) + <span class="hljs-number">1</span>;
                    <span class="hljs-keyword">if</span> (tempstart &gt; start) {
                        start = tempstart;
                    }
                    end++;
                    len = end - start;
                } <span class="hljs-keyword">else</span> {
                    len++;
                    end++;
                }
                charPos.put(chars[i], i);
                <span class="hljs-keyword">if</span> (len &gt; max) {
                    max = len;
                }
            }
            <span class="hljs-keyword">return</span> max;
        }

        <span class="hljs-keyword">public</span> <span class="hljs-keyword">static</span> <span class="hljs-keyword">void</span> <span class="hljs-title">main</span>(String args[]) {
            LongestSubstringNotRepeat l = <span class="hljs-keyword">new</span> LongestSubstringNotRepeat();
            System.out.println(l.lengthOfLongestSubstring(<span class="hljs-string">"abcabcbb"</span>));
            System.out.println(l.lengthOfLongestSubstring(<span class="hljs-string">"bbbbb"</span>));
            System.out.println(l.lengthOfLongestSubstring(<span class="hljs-string">"pwwkew"</span>));
            System.out.println(l.lengthOfLongestSubstring(<span class="hljs-string">"abba"</span>));
        }

---
