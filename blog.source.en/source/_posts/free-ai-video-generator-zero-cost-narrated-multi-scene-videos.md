---
title: 'Free AI Video Generator: How I Built a Zero-Cost Tool for Narrated Multi-Scene Videos'
description: >-
  Tired of paying per second for AI video? I open-sourced a 100% free AI video generator
  — text, images, video, and voiceover all at zero cost. One click to produce narrated,
  subtitled multi-scene AI videos.
categories:
  - AI Practice
tags:
  - ai-video
  - open-source
  - free-tools
  - text-to-video
  - agnes-ai
abbrlink: 22470
tldr: Free AI video generation with zero-cost open-source tool customization
date: 2026-06-16 13:21:16
top_img: /img/22470.jpg
cover: /img/22470.jpg
---

> "The solution is not to suppress AI, but to make it a more equitable capability, so that everyone knows how to create more with AI. This is a very important vision for our company — to make world-class AI belong to everyone."

This is something Bruce Yang, the founder of Agnes AI, said in an interview.

Many Chinese AI companies today — DeepSeek, Zhipu, and others — are driving down the price of AI. To be fair, the cost of text and code processing has already been pushed remarkably low. But video is different. Making AI videos today has an absurdly high barrier — overseas services like Runway and Pika charge tens of dollars monthly, domestic platforms like Jimeng and Keling charge by the second once free quotas run out, and running open-source models locally requires a GPU costing over ten thousand RMB.

Objectively speaking, video generation is genuinely expensive right now. Making industrial-grade video generation available to everyone isn't realistic. But ordinary people should still have ways to experiment and create. Thanks to Agnes for opening up their video model and giving us this opportunity. This project is just a small contribution toward that goal. [Agnes Video Generator](https://github.com/lcy362/agnes-video-generator) ([official website](https://video.lichuanyang.top/)) — it's a free AI video generator. Not "free trial" or "free for 3 generations," but the whole thing: script writing, image synthesis, video rendering, voiceover, subtitles, all at zero cost. You just need a free API key from [Agnes AI](https://platform.agnes-ai.com).

Agnes's video model isn't perfect yet, to be honest. But I want to use this project to grow alongside Agnes, and contribute in my own small way toward AI equity.


<!-- more -->

## Multiple Ways to Use It

Give it a text prompt, get a video back. A few different modes:

**Simple Video.** A straightforward API wrapper — good for testing. Most API parameters are exposed as config options.

**Creative Video.** You write a story idea, like "dark version of The Frog Prince," and the AI handles everything: expand story → generate character references → split into scenes → write shot prompts → generate per-scene video → narration → subtitles → final output. Ten steps, all automatic. By pre-generating end frames, it ensures the best possible visual continuity between scenes.

**Manuscript Video & Digital Anchor.** Paste a long article or script — it auto-splits by speech duration and generates video per segment, or puts a digital anchor there to read it. Everything stitched with a unified TTS narration + subtitle track. Great for explainers and course content.

For detailed parameters and usage guides for each mode, check the [official website](https://video.lichuanyang.top/).

## Getting It Running

```bash
git clone https://github.com/lcy362/agnes-video-generator.git
cd agnes-video-generator
./start.sh
```

That's it. `start.sh` creates a virtual environment, installs dependencies, and starts the server.

Once it's running, open `http://localhost:8765`, paste in your Agnes AI API key at the top, pick a mode, write your idea, and wait patiently for the results.

If you're using an AI coding assistant like Cursor or Claude, I've included a dedicated guide for AI Agents. Just tell your agent to read the `Agents.md` file in the project — it'll handle the whole setup on its own.

## Demos

I made a few demos — check them out:

- [The Frog Prince — no narration](https://v.douyin.com/L4F6KdGnD6U/) — 5 scenes, keyframes chaining, fully auto-generated
- [Same story, with voiceover and subtitles](https://v.douyin.com/l2FlbF1Jdz0/) — AI narration + auto subtitles, see the subtitle effect
- [Manuscript video](https://v.douyin.com/eSGE9KENWVU/) — pasted a long article, auto-split with different visuals per segment

## That's About It

Going back to Bruce Yang's words — "making world-class AI belong to everyone."

This project isn't some grand mission. It's just about keeping the door to AI video creation open. No subscription, no fancy GPU, no cost at all — just a free API key and a machine that can run Python.

Code on [GitHub](https://github.com/lcy362/agnes-video-generator), official website at [video.lichuanyang.top](https://video.lichuanyang.top/). Bug reports welcome.
