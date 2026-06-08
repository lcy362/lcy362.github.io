---
title: My Tips for Improving Development Efficiency
description: "A programmer with nearly six years of experience shares systematic methods for improving development efficiency, emphasizing completing work efficiently within eight hours."
keywords:
  - development efficiency
  - work methods
  - time management
  - programmer
categories:
  - Tech Talk
tags:
  - reflections
abbrlink: 3423
cover: /img/3423.jpg
date: 2021-02-01 17:38:11
---
Hi everyone, I'm Liusha, a programmer with nearly six years of work experience. My career has spanned companies with very different cultures and atmospheres. I've collaborated with many different types of people and observed numerous inefficiencies. At the same time, I've always felt that my own development efficiency is quite high. Throughout my career, I've rarely had to handle work tasks outside of my eight-hour workday. Even when forced to work overtime due to company policy, I was usually executing my own learning plan or doing some deep thinking. So, I'd like to share a systematic summary of development efficiency with everyone.

<!-- more -->

First, let me describe two highly inefficient scenarios:

- Xiao A encounters an unfamiliar error during development, so he carries his laptop over to find the team expert Xiao X. Xiao X then works hard to collect all the necessary information. Meanwhile, Xiao A just stands there watching, occasionally chatting with Xiao X and nearby Xiao Y.
- Xiao C receives a large requirement, quickly skims through it, and starts coding. Halfway through development, he realizes he doesn't understand a certain point in the product spec and goes to ask the product manager. During the conversation, the product manager remembers other things and starts talking about those too. After a long discussion, Xiao C discovers that most of his previous work was wasted.

While these scenarios are somewhat exaggerated, similar situations truly happen all the time. There are many causes for these phenomena, and we'll analyze them thoroughly today. Before diving into efficiency issues, we need to first look at what programmers do daily. The activities that have the greatest impact on work efficiency can be mainly divided into three categories:

1. Daily development
2. Communication
3. Troubleshooting and problem-solving

Next, we'll analyze each of these three areas and discuss how to improve efficiency.

## Daily Development

What situations in daily development cause efficiency to drop? Let me list a few:

- Rework behavior like Xiao C mentioned above
- Large amounts of repetitive labor in daily work, such as writing SQL, writing boilerplate code
- A seemingly small change that turns out to require changes here and there; worse still, you don't even know about "the other changes," so everything breaks when you make the change
- Lack of personal focus, constantly getting distracted

You can see that most of these are related to code design. Regarding design, it really comes down to two points: first, you must design, and second, you must design well.

This means, first of all, you need to know that there should be a design phase before development. Software engineering is a science — it has steps like high-level design and detailed design for good reason. How detailed should the design be before you start coding? My view is: the more detailed the better. In theory, everything except actually writing the code can be done during the design phase.

As for whether the design is good or not, an important evaluation criterion is how easy it is to make changes later. If a single change in requirements causes modifications in multiple places in the code, that's a poor design. Improving this requires learning about design patterns and architecture — there are no shortcuts.

Additionally, regarding the focus issue, everyone can certainly use tools like Pomodoro timers. But tools can only ever be supplementary; the most important thing is to improve your own self-discipline on a personal level.

## Communication

Now let's talk about communication. Communication can be proactive or reactive. Proactive communication is when you initiate it — going to ask others questions or discuss things. Reactive communication is when others initiate — coming to ask you questions or discuss matters.

The main problem with proactive communication is that conversations tend to drift off topic. Here are two suggestions: first, before initiating communication, you must clearly think about what you want to achieve through this communication. Don't go into a conversation with just a vague idea — that kind of communication is the biggest time killer. Second, you can make a communication checklist. Topic drift during conversations is actually a common phenomenon. I don't think there's a need to deliberately try to prevent it. The key is to ensure you get results on what you originally wanted to discuss, which requires a checklist you can use to verify.

Reactive communication is something that easily disrupts work rhythm, but in many cases it's unavoidable — sudden production issues to handle, your manager needing to talk to you, etc. What we can do is reduce unnecessary reactive communication. For example, if you provide a feature, write good documentation and comments so others don't need to ask you to understand it. Method names, return values, and other conventions should be established within the team — when everyone follows them, there's no need to ask to understand things.

Another point is to break down tasks well — do several small tasks instead of one big one. This way, when you're forced to interrupt your work, the cost of "context switching" will be lower.

## Troubleshooting and Problem-Solving

This is also a very important area. For some people, the time spent finding and fixing bugs may far exceed the time spent developing new features. For this, our main goal is to reduce the difficulty and time of troubleshooting. We can approach this from several aspects:

1. Try to expose problems as early as possible, for example by writing unit tests. The same problem appearing in a small module versus a complex system — the troubleshooting difficulty is self-evident.

2. You need sufficient information, such as logs and various types of monitoring data. It's like a physical examination — you first need to see the abnormal indicators before you can do targeted, detailed investigation. Otherwise, with no indicators to go on, you're just blindly guessing.

3. Then there's the troubleshooting approach itself. Everyone needs to gradually accumulate experience and establish a relatively fixed routine for troubleshooting problems. For example, my habit is to first scan all available information when I encounter a problem, identify abnormal indicators, use search engines or others to understand the indicators if I can't read them, think about possible causes based on the indicators, and then verify step by step. An important point here is knowing what kinds of problems to think through yourself versus what kinds of problems should be handled with the help of others or search engines. Xiao A's approach described above is very undesirable — when you ask others or use search engines, the question should be very specific. If you just casually send over an error message, others first need to spend a lot of time collecting information. A problem that could be solved in one hour, if you insist on asking someone else, could easily end up costing two people an entire afternoon.

   What does "specific" mean? For example, if you encounter a ClassNotFoundException and you have no idea what it means, then searching for it is perfectly fine. But if you already know it means the class couldn't be found, then searching again is meaningless. Instead, you should think about why this class couldn't be found and what possible causes there might be.

Besides the above, there's actually another category: the deliberate slacking off that many people choose in the 996 work culture. On this point, I still suggest that everyone use the time freed up by finishing work quickly to improve themselves — slacking off doesn't help. Another point is to vote with your feet — actively seek out companies and teams without an overtime culture, and use your efforts to help them develop better.

If you have thoughts, feel free to exchange ideas in the comments section or on the public account (Mobility).

Original article: https://lichuanyang.top/posts/3423/

---

Source: https://lichuanyang.top/en/posts/3423/
