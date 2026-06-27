---
title: How to Scientifically Browse Zhihu at Work
description: "Sharing a Tampermonkey script that optimizes the Zhihu PC experience for more efficient browsing during work hours."
keywords:
  - Zhihu
  - Tampermonkey script
  - Chrome extension
  - browsing at work
categories:
  - Tech Talk
tags:
  - zhihu
  - tampermonkey
  - chrome-extension
abbrlink: 23393
cover: /img/23393.jpg
date: 2022-12-28 18:29:01
---
Everyone knows what kind of website Zhihu is. Today, let's look at it from a different angle — I'm sharing a small tool to make "browsing Zhihu at work" safer and more efficient.

<!-- more -->

## The Economics of Browsing at Work: Why Zhihu?

I was looking through my own Zhihu account analytics recently and noticed something quite interesting: **over 40% of traffic came from the PC side**. In the mobile internet era, that number is unusually high.

I also learned from other sources that Zhihu's traffic on weekends and holidays is noticeably lower than on workdays. What does this tell us?

**You're not the only one browsing Zhihu at work.**

For a significant portion of people, Zhihu's primary use case is — browsing during work hours. And Zhihu happens to be uniquely suited for this:

- **Primarily text-based content**: Unlike short videos, there's no sound and minimal data usage
- **Plenty of professional content**: When your boss walks by and glances at your screen, you can genuinely say "I'm looking up technical material"
- **Right-sized articles**: A timeline of posts you can read a few minutes at a time, with very little mental overhead

## Three Pain Points of Browsing Zhihu at Work

However, some of Zhihu's PC design choices aren't exactly friendly for the covert browser:

**1. Oversized Images**

Article images on Zhihu often take up more than half the screen. No matter how serious the article itself is, a giant image on your display is instantly noticeable to anyone passing by — at that point, saying "I was reading a technical article" doesn't sound very convincing.

**2. Attention-Grabbing Title Banner**

When browsing Zhihu questions, there's a very conspicuous title banner hovering at the top of the page. It doesn't just take up a full line of space — its white background with black text makes it extremely eye-catching. A passerby can tell at a glance you're on Zhihu.

**3. In-Your-Face Logo**

Zhihu's logo sits prominently in the top-left corner of every page. Anytime someone glances at your screen or you take a screenshot, that brand identity is unmistakable.

## The Script Solution

I wrote a Tampermonkey script that targets these three problems head-on:

- **Limit image size**: Maximum width set to 300px, turning all article images into unobtrusive thumbnails
- **Hide the title banner**: The question page title banner is removed entirely
- **Remove the Zhihu logo**: The logo in the top-left corner is hidden

The result: Zhihu pages end up looking like a plain text reader — clean, low-key, and perfectly suited for an office environment.

## Installation & Usage

The script is published on GreasyFork:

**[Install link](https://greasyfork.org/zh-CN/scripts/483047-%E6%91%B8%E9%B1%BC%E5%8A%A9%E6%89%8B-%E7%9F%A5%E4%B9%8E)**

Prerequisite: you need the Tampermonkey extension installed in your browser. Once installed, the script takes effect automatically — no configuration required.

## Technical Implementation

The script's implementation is actually extremely simple. At its core, it just injects custom CSS via `GM_addStyle`:

```javascript
// Limit maximum image width
GM_addStyle('.RichContent img { max-width: 300px !important; }');

// Hide the title banner
GM_addStyle('.QuestionHeader { display: none !important; }');

// Remove the logo
GM_addStyle('.AppHeader-logo { display: none !important; }');
```

Essentially just a few lines of CSS — but remarkably effective. That's part of the beauty of Tampermonkey scripts: often you don't need complex logic; just injecting some CSS can dramatically change a webpage's visual experience.

## How It Differs from the "Zhihu Enhancement Tool"

I previously wrote a [Zhihu Enhancement Tool](/posts/44912/), which focuses on **information enhancement** — displaying comment timestamps down to the second. This script, by contrast, is about **visual optimization** — making Zhihu look more like a legitimate reading tool in a workplace setting.

Both scripts can be installed simultaneously; they don't conflict with each other.

If you have other pain points with the Zhihu experience, feel free to leave a comment. You might also want to check out my other [Zhihu Enhancement Tool](/posts/44912/) — it shows comment timestamps down to the second, which is great for tracing the timeline of technical discussions.

---
