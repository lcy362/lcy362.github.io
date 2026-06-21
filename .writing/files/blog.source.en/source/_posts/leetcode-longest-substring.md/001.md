---
title: 'LeetCode Problem 3: Longest Substring Without Repeating Characters'
description: "Detailed solution for LeetCode Problem 3: finding the length of the longest substring without repeating characters using the sliding window approach."
keywords:
  - LeetCode
  - sliding window
  - longest substring
  - algorithm
  - string
categories:
  - Algorithm
tags:
  - algorithm
  - leetcode
abbrlink: 43423
cover: /img/43423.jpg
date: 2017-02-15 20:34:00
---
## Problem

Given a string, find the length of the longest substring without repeating characters.

Examples:

Given "abcabcbb", the answer is "abc", which the length is 3.

Given "bbbbb", the answer is "b", with the length of 1.

Given "pwwkew", the answer is "wke", with the length of 3. Note that the answer must be a substring, "pwke" is a subsequence and not a substring.

In other words, given a string, output the length of the longest substring without repeating characters.

## Approach

The problem can be solved in a single pass with O(n) complexity. The main idea is to:

1. Record the last position where each character appeared
2. Maintain a substring (tracked by `start` and `end` indices) that contains no repeating characters up to the current position

During traversal, `start` and `end` are continuously updated based on whether the character at the current position has been seen before and its last occurrence position.

## Code

The code can be viewed on GitHub: [https://github.com/lcy362/Algorithms/tree/master/src/main/java/com/mallow/algorithm](https://github.com/lcy362/Algorithms/tree/master/src/main/java/com/mallow/algorithm)

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
