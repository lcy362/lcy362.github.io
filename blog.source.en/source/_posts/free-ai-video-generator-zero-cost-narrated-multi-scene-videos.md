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
date: 2026-06-16 13:21:16
top_img: /img/22470.jpg
cover: /img/22470.jpg
---

The other day I wanted to generate a short AI video, maybe 15 seconds. Opened up one of those popular tools, saw the pricing — per-second billing, and a one-minute video would cost me more than my lunch.

So I figured, why not just build one myself.

That's how [Agnes Video Generator](https://github.com/lcy362/agnes-video-generator) ([official website](https://video.lichuanyang.top/)) came to be. It's a free AI video generator — and I don't mean "free trial" or "free for 3 generations." I mean the whole thing: script writing, image synthesis, video rendering, voiceover, subtitles, all of it costs nothing. You just need a free API key from [Agnes AI](https://platform.agnes-ai.com) and you're set.

The inspiration came from a quote by Bruce Yang, the founder of Agnes AI:

> "The solution is not to suppress AI, but to make it a more equitable capability, so that everyone knows how to create more with AI. This is a very important vision for our company — to make world-class AI belong to everyone."

Making AI videos today has an absurdly high barrier. Overseas services like Runway and Pika charge tens of dollars monthly, domestic platforms charge by the second once free quotas run out, and running open-source models locally requires a GPU costing over ten thousand RMB. But if the AI models themselves can be free, that door shouldn't be closed. This project exists to prove that point.

<!-- more -->

## Four Ways to Use It

Give it a text prompt, get a video back. Depending on how much you want the tool to do for you, there are four modes:

**Simple Video — the quick one.** Type a description, pick resolution and duration, hit generate. Supports text-to-video, image-to-video, and keyframes.

**Creative Video — the fun one.** You write a story idea and the AI takes over: expand story → generate character references → split into scenes → write shot prompts → generate per-scene video → narration → subtitles → final output. Ten steps, all automatic. I was honestly surprised when I first got this pipeline working end to end — the output quality was way better than I expected.

**Manuscript Video — the practical one.** Paste a long article or script, it auto-splits by speech duration, generates video per segment, and stitches everything with a unified TTS narration + subtitle track. Great for explainers and course content.

**Digital Anchor — the newest one.** AI generates a virtual anchor (or upload your own image), creates dynamic anchor clips with TTS narration and subtitles, and loops them into a complete anchor video. Perfect for product presentations or news-style content.

For detailed parameters and usage guides for each mode, check the [official website](https://video.lichuanyang.top/).

## How Is This Free?

Fair question. Free usually means "you get what you pay for," right?

The honest answer is: Agnes AI, the platform this is built on, offers free model APIs. It's not some hack or workaround:

| What it does | Model used | Price |
|-------------|-----------|-------|
| Writes scripts and narration | agnes-2.0-flash | $0 |
| Generates images | agnes-image-2.1-flash | $0 |
| Generates video | agnes-video-v2.0 | $0 |
| Voiceover | Microsoft Edge TTS | $0 (no API key needed) |

The first three are Agnes AI's free-tier models. The voiceover uses Microsoft Edge TTS, which has always been free. Put them together and you get a full video production pipeline at zero cost.

Why would Agnes AI offer these models for free? Bruce Yang puts it simply: "Making world-class AI belong to everyone." It's not charity — it's a belief that AI shouldn't belong only to those who can afford the bill. To be honest, the video model isn't perfect yet — complex actions occasionally deform — but it iterates fast. I chose to grow with it rather than wait for a "perfect" commercial solution.

As for quality — it's genuinely usable. Edge TTS's Chinese voices surprised me the most; the "Xiaoxiao" voice sounds surprisingly human. Is it going to match top-tier paid tools? No. But then again, those tools charge by the second.

## A Few Details Worth Mentioning

Subtitles, voiceover, scene transitions — the [official website](https://video.lichuanyang.top/) covers all the parameters in detail. Here are a few design choices I think are worth calling out:

**Word-level subtitle sync.** Edge TTS gives you precise timestamps for every word, so subtitles are aligned at roughly one entry every 2-3 characters, perfectly synced with the voiceover. Long subtitles auto-wrap at punctuation marks, so you never get a dangling "the" on the second line.

**Scenes don't hard-cut.** In keyframes mode, each scene's last frame automatically becomes the next scene's first frame, giving smooth visual transitions. The Frog Prince demo uses this. There are also transition-frame and independent modes.

**Checkpoint resume.** A creative video takes 10 pipeline steps. If something breaks midway, each step's state is persisted to disk — restart and click "Resume" to pick up where you left off, without wasting API calls.

**Audio is laid as one track.** Not per-scene voiceover stitched together (that accumulates silences). All video clips are concatenated first, then a single narration track is laid across the full timeline.

The tech stack is Python FastAPI + a single-file Tailwind frontend. Not a huge codebase, but it does what it needs to. If you're curious about the implementation, the [GitHub source](https://github.com/lcy362/agnes-video-generator) and AGENTS.md have thorough documentation.

## Getting It Running

```bash
git clone https://github.com/lcy362/agnes-video-generator.git
cd agnes-video-generator
./start.sh
```

That's it. `start.sh` creates a virtual environment, installs dependencies, and starts the server. Only prerequisites: Python 3.10+ and ffmpeg.

Once it's running, open `http://localhost:8765`, paste in your Agnes AI API key at the top, pick a mode, write your idea, and go grab a coffee.

If you're using an AI coding assistant like Cursor or Claude, the project has a detailed `AGENTS.md` — just tell your agent to read it and it'll handle the whole setup on its own.

## Demos

No point in me describing the output — just watch:

- [The Frog Prince — no narration](https://v.douyin.com/L4F6KdGnD6U/) — 5 scenes, keyframes chaining, fully auto-generated
- [Same story, with voiceover and subtitles](https://v.douyin.com/l2FlbF1Jdz0/) — this is where it starts to feel like a real video
- [Manuscript video](https://v.douyin.com/eSGE9KENWVU/) — pasted a long article, auto-split with different visuals per segment

My favorite is the second one. The narration and subtitles really make it feel like something you'd actually watch.

## Things I Should Be Honest About

The project is early stage — corner cases may not all be handled. Flaky network can cause occasional retry failures, but usually works if you just run it again. The core generation pipeline works reliably. If you run into issues, feel free to file one on [GitHub](https://github.com/lcy362/agnes-video-generator).

## That's About It

Going back to Bruce Yang's words — "making world-class AI belong to everyone."

This project isn't some grand mission. It's just about keeping the door to AI video creation open. No subscription, no fancy GPU, no cost at all — just a free API key and a machine that can run Python.

MIT-licensed, code on [GitHub](https://github.com/lcy362/agnes-video-generator), official website at [video.lichuanyang.top](https://video.lichuanyang.top/). Issues and PRs welcome.

It's free. Give it a shot — worst case you waste ten minutes.
