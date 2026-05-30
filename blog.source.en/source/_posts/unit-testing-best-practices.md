---
title: "Unit Testing Best Practices: Practical Experience and Guidelines"
description: "Combining prior perspectives and practical experience, this article summarizes how to write unit tests — a systematic guide from purpose and principles to concrete implementation."
keywords:
  - unit testing
  - testing practice
  - junit
  - code quality
categories:
  - Tech Talk
tags:
  - unit testing
  - development standards
  - unit testing best practices
abbrlink: 695
date: 2019-09-26 20:54:36
---
A while ago, when I was trying to improve the unit tests for a project, I realized that I never had a particularly clear understanding of how to write unit tests. So I looked up some materials, and in the process discovered that everyone's perspectives are quite different. Every article I read updated my own understanding. This article combines others' viewpoints with my own practical experience to summarize what I currently believe to be correct. It probably won't be the most definitive answer, and I welcome everyone to leave comments and discuss.

<!-- more -->

Let me first state the purpose of writing unit tests, which is the foundation for all the following discussion. The significance of unit tests should be to ensure the correctness of existing code when modifications are made. In other words, after modifying code, running through the existing test cases — if they pass, it means the previous logic is still working.

Below, I'll list specific principles that I believe should be followed when writing unit tests.

### Avoid Dependencies on the Environment

Unit tests should not depend on the environment, including dependencies on the network, database, I/O, data, external interfaces, etc. This point should be relatively uncontroversial, because unit tests have many execution scenarios — such as manual triggering by developers, automatic triggering when code is committed, automatic triggering during packaging, etc. If unit tests can't eliminate environmental dependencies, their execution scenarios will be greatly limited.

Achieving this requires the help of many tools, such as in-memory databases, embedded Redis servers, mocking, etc. This will inevitably add a lot of work to the unit test writing process, but it's unavoidable.

### Test Business Logic, Not Implementation

Tests should target business logic, not implementation logic. This is a point that will generate more debate, mainly because people can't agree on the definition of "unit." Some believe that a single function is a "unit," but if you follow this standard for unit testing, the tests won't achieve the expected results.

A simple example: when refactoring code, should you change the unit tests? The answer is no. If every code refactoring requires corresponding changes to unit tests, the value of unit tests is largely lost. Therefore, the "unit" being tested should be a business unit. Of course, this shouldn't be too rigid — for example, writing a unit test for a complex method is perfectly fine. A more accurate approach is: write unit tests based on intent, not based on implementation. In other words, treat the code's implementation logic as a black box and only test inputs and outputs.

### Minimize Mocking

In the first point above, we mentioned using mocks to avoid external environment dependencies. But mocking must not be overused. You can read about [The Seven Deadly Sins of Mocking](https://gitbook.cn/books/58fa1af500a2684bf77511bc/index.html). The principle is: don't mock if you don't have to. When is mocking necessary? When you need to depend on external environments. In all other cases, don't mock.

### Unit Tests Drive Refactoring

When writing unit tests, you'll find that some tests are very difficult to write. Analyzing the specific reasons for this difficulty, you'll find that sometimes it's because the code itself is poorly written. For example, if a class has too many dependencies, it might be because the class's responsibilities are unclear and unrelated code has been lumped together. At this point, you should directly refactor the code, splitting it into several classes, and the difficulty of writing unit tests will naturally decrease.

Source: https://lichuanyang.top/en/posts/695/
