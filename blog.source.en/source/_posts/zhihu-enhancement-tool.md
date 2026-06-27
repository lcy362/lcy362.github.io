---
title: Zhihu Enhancement Tool — Comment Timestamps Down to the Second
description: "Tampermonkey script: Display Zhihu comment timestamps with second-level precision, fixing the time display issues after Zhihu's update."
keywords:
  - Zhihu
  - Tampermonkey script
  - time display
  - Chrome
categories:
  - Tech Talk
tags:
  - zhihu
  - tampermonkey
  - chrome-extension
abbrlink: 44912
cover: /img/44912.jpg
date: 2023-12-22 17:24:18
---
Zhihu, as a high-quality text community, often features deeply insightful comment discussions. However, Zhihu's default comment timestamp format has a subtle but frustrating problem — it only shows relative times like "3 hours ago," "yesterday," or "5 days ago." That's fine for casual browsing, but if you're trying to trace the timeline of a discussion or compare the order of different comments, this fuzzy time display is completely inadequate.

<!-- more -->

## The Problem: Limitations of Relative Time

Relative timestamps come with a few clear downsides:

1. **Information loss**: You never know exactly what hour and minute "3 hours ago" actually refers to — there's no way to form a precise mental timestamp anchor
2. **Cross-day confusion**: After today passes, "yesterday" becomes "the day before yesterday," and the reference frame keeps shifting
3. **Discussion tracking is hard**: In a technical discussion, person A might reply to person B's point, but B's comment and A's reply might both show "2 days ago" — you can't tell who posted first

## How This Script Came About

I previously saw a complaint on [Appinn](https://meta.appinn.net/t/topic/47711/18) about the chaotic time display in Zhihu's comment sections. Someone in that thread quickly whipped up a Tampermonkey script to solve the problem right then and there.

I used it for several months and the experience was excellent. Then, a while back, Zhihu pushed a frontend update that broke the script — time display became messy again. I spent an afternoon digging into Zhihu's new DOM structure, fixed the script's logic, and decided to publish it on GreasyFork. This way, if Zhihu makes more adjustments in the future, updates can be pushed directly from GreasyFork — no need for manual reinstallation.

## Installation & Usage

The script is published on GreasyFork:

**[Install link](https://greasyfork.org/zh-CN/scripts/482871-%E7%9F%A5%E4%B9%8E%E5%A2%9E%E5%BC%BA-%E8%AF%84%E8%AE%BA%E6%97%B6%E9%97%B4%E7%B2%BE%E7%A1%AE%E5%88%B0%E7%A7%92)**

Prerequisite: you need the Tampermonkey extension installed in your browser:

- **Chrome**: [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **Edge**: Search for Tampermonkey directly in the Edge Add-ons store
- **Firefox**: [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)

Once Tampermonkey is installed, click the GreasyFork link above and then click "Install this script." The script will automatically take effect in Zhihu's comment sections — no additional configuration needed.

## Technical Implementation Overview

The core logic of the script isn't complicated. It comes down to three key steps:

**1. Locating the Time Elements**

Zhihu stores comment timestamp information on a `span` element. In the old version, the full timestamp was stored in the `title` attribute. After Zhihu's update, they switched to a different attribute, so the script needed to adapt to the new DOM structure.

**2. Extraction & Formatting**

The script reads the raw ISO time string from the DOM element (e.g., `2024-01-15T14:32:08.000Z`) and formats it into a human-readable format like `2024-01-15 14:32:08` using JavaScript, replacing the original relative time text.

**3. Handling Dynamic Loading**

Zhihu's comment sections use lazy loading — more comments only load as you scroll to the bottom. The script uses a `MutationObserver` to listen for DOM changes, so when new comments are inserted into the page, it automatically applies the same precise timestamp treatment to them.

## Future Plans

I'm planning to extend this script with more features, such as:

- **One-click jump to referenced comments**: Zhihu's reply format is "replying to xxx," but there's no way to jump directly to the quoted comment
- **Highlight OP (Original Poster) comments**: Quickly spot the question author's replies in long discussions
- **Comment export**: Export insightful discussions as Markdown

If you have other pain points with the Zhihu experience, feel free to leave a comment with your feature requests. If there's interest in Tampermonkey script development, I might consider putting together a beginner's tutorial on the topic in the future.

---
