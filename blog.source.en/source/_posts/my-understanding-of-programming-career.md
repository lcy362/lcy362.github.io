---
title: Reflections on a Programmer's Career — My Understanding of the Programming Profession
description: "Sharing long-term thoughts and cognitive iterations on the programming career from two dimensions: 'what we do' and 'capability model'."
keywords:
  - programmer
  - career development
  - capability model
  - cognitive upgrade
categories:
  - Tech Talk
tags:
  - reflections
abbrlink: 27398
cover: /img/27398.jpg
date: 2020-03-18 17:21:18
---

Over the years of working, I've been constantly thinking about what a programmer actually does. As I've gained more experience, my understanding has continuously evolved. Writing this article now serves two purposes: sharing my thoughts, and leaving a record to revisit in a couple of years to see how my understanding has further changed.

<!-- more -->

I want to discuss this from two perspectives. First, from the work itself — in my view, a programmer's work falls into three categories: discovering problems, analyzing problems, and solving problems. In fact, the vast majority of jobs in the world can be encompassed within these three types of work. Second, from a capability standpoint, I divide abilities into two kinds: the ability to understand the real world, and the ability to map the real world into programming languages.

Regarding the three types of work, in order from discovering to analyzing to solving problems, they progress from macro-level to detail-level. Day-to-day work primarily involves solving problems — all kinds of miscellaneous tasks are fundamentally about solving problems. Discovering and analyzing problems require deeper thinking, but in terms of work itself, I don't think there's any hierarchy among these three types. Being able to consistently provide appropriate solutions to identified problems is a formidable core competitiveness in the workplace. As for the two types of capabilities, people generally focus more on the second one. However, I believe the ability to understand the real world is extremely important for a programmer's career development. Think about it — when it comes to working on business logic or writing CRUD operations, is there a threshold? I think there is — doing business logic well has a very high threshold. Some people always implement business logic in peculiar ways and then blame product managers for unclear requirements, when the real issue may be a lack of understanding of the real world.

Let me elaborate on each of the three types in order.

**Discovering problems** isn't strictly necessary for programmers. Many problems, even if you don't discover them — or discover them and pretend they don't exist — the system can still run fine. But gradually accumulating such problems will inevitably lead to unmaintainable code. Let me illustrate with a real experience. I once worked on a project involving passenger flight records. We could obtain data for almost all domestic flights. When storing the data, we used ID document numbers as the primary key — because all booking systems use document numbers as their key. But our product displayed data from the user dimension, and a single user could have multiple documents. This meant that even very simple queries — like retrieving a user's most recent flight record or the last ten records — required complex processing. And as data volume grew, sharding was needed, but documents belonging to the same user couldn't fall into the same table, adding another level of logical complexity. At this point, not discovering the problem wouldn't prevent the business from functioning, but working on this piece of business would be extremely painful. Only after recognizing the problem and making adjustments did I realize how simple this business logic actually was.

So how do we discover problems? This requires the ability to understand the real world, as well as sufficient understanding of fundamental concepts like design patterns. To discover problems, we first need a notion of what the "normal state" should look like — anything deviating from that normal state is a problem. In the earlier example, one "normal state" is that querying a user's recent flight records should be very simple. Another "normal state" is that our user is a person, not a document. When we noticed the deviation from the normal state, we discovered the problem. Some other examples: writing unit tests should be straightforward — when you find unit tests are hard to write, you need to consider whether the code design has issues. A MySQL batch request should take milliseconds, and data volume shouldn't significantly affect duration — when you notice the relationship between data volume and latency becoming a steep linear function, consider whether you're actually performing a batch operation (see https://lichuanyang.top/posts/63688).

**Analyzing problems** is essentially decomposing a manifesting issue into one or more "metrics" that have gone wrong. These "metrics" can be actual measurements like memory or CPU, or they can be basic conceptual understandings and design approaches. In the earlier example, the problem we discovered was that very simple requirements were difficult to implement. The "metric" that eventually turned out to be the root cause was the choice of primary key for storing records.

For analyzing problems, you should make reasonable conjectures and then use tools to verify or disprove your guesses. Once I discovered data wasn't being saved to the database. I could form several reasonable hypotheses: the database itself had an issue; the connection to the database was problematic; the transaction wasn't committed normally; logic errors prevented data from being generated; and so on. Then I checked the logs for errors, looked at MySQL monitoring for uncommitted transactions. Step by step, the problem was pinpointed.

**Solving problems** is what most programmers spend the most time doing. For a programmer, solving problems means representing real-world concepts in a computer. The two most critical aspects, in my understanding, are: first, decomposing tasks — breaking a large task into independent subtasks; and second, the ability to quickly understand and use new tools — essentially, continuous learning. Many people complain that there's too much to learn as a programmer. But you must pay attention to what's worth spending significant time on and what you only need to skim through. I've noticed many people are enthusiastic about learning tools, enjoying writing various versions of Hello World — in my view, this is ineffective learning. Programming learning requires both depth and breadth. Depth means thoroughly researching certain technologies — after studying some, you'll find that various technologies, which may seem unrelated on the surface (like databases and message queues), actually share many similar concepts and ideas. Once you've studied some in depth, you can build your own knowledge system, and then learning new things becomes much faster.

Because every new technology emerges from the urgent need to solve practical problems. For example, why was ClickHouse created? Because row-storage databases like MySQL aren't suitable for data analysis, and there was no columnar storage database with both good performance and stability. Similarly, Jedis connecting directly to Redis Server doesn't perform well in multi-threaded environments, which is why Lettuce was created. Once you understand what problem needs to be solved, try thinking about what solution you would propose. Then look at the actual solution. If your approach is similar — congratulations, your understanding of technology has reached a new level. If it's different — congratulations again, you've learned a new way of thinking. These insights can be applied whenever you work on business logic in the future.

Let's keep growing together.

Source: https://lichuanyang.top/en/posts/27398/
