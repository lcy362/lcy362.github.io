---
title: Reducing Software Development Complexity Through Proper Design
description: "A systematic analysis of the causes of software complexity and methods to reduce it, covering module division, eliminating duplication, and decoupling."
keywords:
  - software design
  - complexity
  - modularization
  - decoupling
  - refactoring
categories:
  - architecture-design
tags:
  - reflections
  - software-engineering
  - design-patterns
abbrlink: 33852
date: 2021-01-04 18:12:34
---
For a programmer, the word most often mentioned in daily work is probably "complex" — this code is too complex, this logic is too complex. So, in this article, let's take a thorough look at where "complexity" actually comes from and how to avoid it.

<!-- more -->

## The Origins of Complexity

Let's first list what we're actually talking about when we say something is "complex":

- No module division, just a massive blob of code sitting there
- Large amounts of duplicate code
- The overall logic of the code is incomprehensible
- A seemingly simple requirement that turns out to require changes here and there when you try to modify it
- Code can't be migrated or reused
- Mysterious bugs keep appearing all the time
- ...

Many of these problems listed above are actually cause and effect of each other. For example, poor module division leads to incomprehensible code logic, which also leads to code that can't be reused. Code that can't be reused leads to large amounts of duplicate code, and duplicate code further leads to incomprehensible code logic.

So, below let's try to organize these problems and see where the real issues lie.

I think we can first roughly categorize code complexity problems into two types: problems with the code itself, and problems with the code's expressiveness of the real world. The former mainly concerns the overall cleanliness of the code and how easy it is to maintain continuously; the latter mainly affects how easy the code is to understand and whether others need a lot of background knowledge when reading the code.

Regarding problems with the code itself, in my observation, the primary reason for excessive code complexity is unclear module splitting, or even no module splitting at all. The problems listed above — duplicate code, inability to reuse, needing to modify the same logic in multiple places — all fundamentally stem from module splitting issues. There are also some naming problems that make code even more unmaintainable.

Regarding the code's expressiveness of the real world, I think a big problem is that code is too disconnected from reality, making it so that business background knowledge alone isn't enough to understand how the code is implemented. At the same time, when you implement real-world requirements with a design that doesn't match reality, every step becomes difficult. For example, consider a business that displays user flight tickets — if all upstream airlines use "user ID number" as the data key, what should your key be? Should it also be the ID number? If you do that, and then if you implement database sharding, you can imagine how complex implementing a basic function like "query user's most recent ticket" would become.

Once we reason through to this point, we can see that these issues basically cover all the problems listed at the beginning. Issues like frequent bugs are actually a manifestation of logical complexity. Because the logic is complex and incomprehensible, bugs are inevitable.

Additionally, there's one more issue: each of the points mentioned above has an exponential amplification effect as the program scale increases. Many people can probably relate — if you have a 5-day effort requirement versus five independent 1-day effort requirements, the first one will actually take much more time and produce many more bugs in the end.

So, next let's provide some solutions for these issues.

## Solutions

## Module Splitting

First and foremost, the top priority is doing module splitting well. You need to do splitting well at every level — for example, how to define microservice boundaries, what content goes into which class, what content goes into which method. It's no exaggeration to say that good module splitting can solve over 80% of development problems.

For example, "Putting an elephant in the fridge takes three steps: one, open the fridge door; two, put the elephant in; three, close the fridge door." This is a very reasonable module split. Of course, each of the three steps can be further refined. For example, opening the fridge door includes: grip the handle, pull with force in two steps; putting the elephant in includes: find a strongman, lift the elephant, place it in the fridge, release — four steps.

The core element of splitting is that it must be reasonable. For business logic, this means it should conform to our understanding of the real world. In the example above, you can't forcibly group "pull with force, find a strongman, lift the elephant" into one method. However, this phenomenon is actually very common in real business development. Many people see a method that's too long, know they need to split it, but just randomly grab a chunk of code and extract it. This way, the code may look a little better, but it won't achieve the effect of reducing complexity.

Also, splitting has no end — each sub-module can be further split into finer sub-modules until the module is sufficiently easy to understand.

## High Cohesion

Talking about cohesion here mainly means controlling complexity within the smallest possible scope. Using the example above, "find a strongman" is the most complex step, because there's simply no such strongman. But the complexity here is only the internal implementation of this small module — only this one small module is complex; the higher levels or other modules shouldn't feel this complexity.

However, in actual development, we often see some highly complex underlying structures constantly exposed across various levels and modules of the system, making it impossible for complexity to converge. As the project scale grows, the overall complexity will increase exponentially.

## Naming

This is a more detailed point. The core requirement of naming is first and foremost accuracy. For variable names, method names — when seeing the name, you should be able to roughly understand the related logic without looking at the code details.

Second, naming should have contextual consistency. For example, for a programmer, you can't call them "coder" one moment and "programmer" the next, otherwise others will be confused when trying to understand.

Actually, that covers everything. Does it feel simpler than you expected? The truth is, as long as you do module splitting well and put each piece of code in the right place it belongs, development isn't that complex.

Original article: http://lichuanyang.top/posts/33852/

---

Source: https://lichuanyang.top/en/posts/33852/
