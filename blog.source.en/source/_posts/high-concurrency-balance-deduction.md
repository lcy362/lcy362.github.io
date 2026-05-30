---
title: 'Some Experience with Balance Deduction Under High Concurrency'
description: "Practical experience with balance deduction under high concurrency scenarios, solving billing system issues caused by concurrent user operations on the same account."
keywords:
  - high concurrency
  - balance deduction
  - billing system
  - concurrency control
categories:
  - Architecture Design
abbrlink: 56940
date: 2018-08-25 11:10:28
tags:
  - design
---

Recently, I participated in optimizing an older billing system and learned some common techniques for balance deduction under high concurrency. I also tried some approaches, so I'm summarizing my findings here.
<!-- more -->

## Problem Description

For a billing system, concurrency issues are actually divided into two categories. The first is high application concurrency—essentially a large number of users and high access volume. This type of problem is no different from general high concurrency problems and can be solved using distributed techniques. The second category is user concurrency issues that generally cannot be solved by distributed methods alone, which is what this article will focus on.

This type of problem stems from high-frequency access to certain accounts. A large number of concurrent accesses cause bottlenecks to first appear at certain database records. Many operations end up waiting because they cannot acquire row locks on the database, and these waiting operations consume other resources, eventually leading to system unavailability.

The following sections introduce some common approaches to handle this type of problem.

## Not Setting a Balance Field

Since a stable billing system must record billing transaction details, it's entirely possible to not have a balance field and instead calculate the balance based on transaction details.

However, this method is not universal. For example, in an advertising billing system where the frequency is very high and each transaction amount is very small, trying to calculate the balance by summing up transactions is clearly impractical.

## Merging and Splitting

These are two different approaches, but since they share some similarities—both aim to reduce access pressure on individual database records—I'll discuss them together.

Merging involves consolidating multiple requests for a single account before writing to the database, effectively reducing the pressure by several times.

Splitting involves breaking a main account into several sub-accounts and distributing requests across them, reducing the pressure on any single account. Then, other techniques are used to merge the sub-account data into the main account data for returning to the user.

## Reducing Row Lock Hold Time

This is a code-level optimization. As mentioned earlier, the reason high-frequency accounts cause system performance issues is the contention for row locks. So if we can reduce the time each request holds a row lock, system performance will improve significantly.

First, try to speed up the execution between acquiring the row lock and committing the transaction. Move unnecessary operations, especially time-consuming ones, to be executed elsewhere—either before acquiring the row lock or outside the transaction.

Then, try to avoid acquiring row locks using:

```
select ... for update
```

Instead, use the following approach:

```java
update xxx set amount=amount-1 where id=x and amount>=1
```

If the business logic allows negative balances, you can omit the amount validation in the WHERE clause. Otherwise, when the balance would go negative, you should skip the database update and return an exception in the application code.

## Rate Limiting

Since high-frequency accounts only cause system performance issues when a single account's concurrency reaches a certain level, we can forcibly control this concurrency level to keep it within an acceptable range for the system.

## Caching

Caching is also a common approach for handling high-frequency accounts. Operations are performed on the balance in the cache, and the data is synchronized to the database periodically.

The above methods each have their applicable conditions and limitations. For example, merging and rate limiting both result in delayed deduction. During this delay period, the account balance might already be exhausted. So for business scenarios where the balance strictly cannot go negative and records cannot be discarded, these approaches may not be suitable.

In summary, the most important thing is to choose the appropriate solution based on the business scenario.

Source: https://lichuanyang.top/en/posts/56940/
