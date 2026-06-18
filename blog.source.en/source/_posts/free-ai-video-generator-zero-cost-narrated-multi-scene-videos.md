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

That's how [Agnes Video Generator](https://github.com/easyeye163/agnes-video-generator) ([official website](https://video.lichuanyang.top/)) came to be. It's a free AI video generator — and I don't mean "free trial" or "free for 3 generations." I mean the whole thing: script writing, image synthesis, video rendering, voiceover, subtitles, all of it costs nothing. You just need a free API key from [Agnes AI](https://platform.agnes-ai.com) and you're set.

<!-- more -->

## Three Ways to Use It

Give it a text prompt, get a video back. But depending on how much you want the tool to do for you, there are three modes:

**Simple Video — the quick one.** Type a description, pick a resolution (portrait, landscape, or square), choose a duration between 5 and 20 seconds, hit generate. Supports text-to-video, image-to-video, and keyframes. Good for figuring out whether this whole thing actually works.

**Creative Video — the fun one.** This is my favorite part. You write a story idea — say, "a dark twist on The Frog Prince" — and the AI takes over from there. It expands your idea into a full story, pulls out character descriptions, generates reference images, splits the story into scenes, writes detailed shot-by-shot prompts for each one (think "low-angle shot, warm backlight, shallow depth of field"), then generates video for every scene, writes narration, produces a voiceover, adds word-level subtitles, and stitches everything into a finished video. Ten steps, all automatic. You just sit back and wait.

I was honestly surprised when I first got this pipeline working end to end. The AI's shot descriptions are occasionally a bit weird, but the overall output quality was way better than I expected.

**Manuscript Video — the practical one.** Paste in a long article or script, and it auto-splits by speech duration (~4 characters per second for Chinese, or by word count for other languages). Each segment gets its own AI-generated video, and a single TTS narration + subtitle track runs across the whole thing. I tested it with one of my old blog posts and got something that actually looked like a proper explainer video. If you make educational content, this one's for you.

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

As for quality — it's genuinely usable. The video generation produces decent frames; characters glitch out occasionally but most of the time it looks fine. The LLM-written shot descriptions are honestly better than what I'd write myself (low bar, I know). And Edge TTS's Chinese voices surprised me the most — they don't have that robotic monotone you'd expect. The "Xiaoxiao" voice in particular sounds surprisingly human if you're not paying close attention.

Is it going to match top-tier paid tools? No. But then again, those tools charge by the second.

## Let's Talk About Subtitles and Voiceover

Nothing ruins a video faster than subtitles that don't match the audio.

The subtitles in this project aren't just the narration text chopped into rough blocks and slapped on screen. Edge TTS has a feature called SubMaker that gives you precise timestamps for every single word. So subtitles are aligned at the word level — roughly one subtitle every 2-3 characters, perfectly synced with the voiceover.

Here's a small detail I'm proud of: long subtitles auto-wrap to two lines, and the line break is chosen at punctuation marks. So you never get a lonely "the" or "的" dangling on the second line, which drives me crazy in other tools. Font, color, size, position, stroke — all customizable. Though I usually just leave the defaults alone.

There are 4 Chinese voice options. My picks: "Xiaoxiao" (gentle female) for most things, "Yunyang" (steady male) for more serious content. The speech rate is adjustable — I usually bump it to +10% because the default is a bit slow for my taste.

## The Scene Transition Problem

Here's something that's not obvious until you actually try making multi-scene videos: if you generate 5 scenes independently and just concatenate them, the result feels jarring. Each scene has its own visual "vibe" and the cuts are rough.

I tried a few approaches and ended up with three modes:

**Keyframes mode** is what I'd recommend. The idea is dead simple: you specify what the first and last frame of each scene should look like. Scene 1's last frame automatically becomes Scene 2's first frame, Scene 2's last frame becomes Scene 3's first frame, and so on. This gives you visual continuity between adjacent scenes. The Frog Prince demo uses this and the transitions are pretty smooth.

**Transition frame mode (ti2vid)** works differently: it grabs the last frame of the previous scene, runs it through img2img to create a "transition" image, and uses that as the next scene's opening frame. It works, but it's less controllable than keyframes and sometimes the transition image looks a bit... off.

**Independent mode** is the simplest — all scenes share the same reference image but are generated without caring about each other. Good enough for explainer-style content where scenes don't need to flow into each other visually.

## Some Technical Details

Backend is Python + FastAPI. Frontend is a single HTML file with Tailwind CSS, no build step. About 5,000 lines of Python and 1,500 lines of frontend. Not a huge codebase, but it does what it needs to.

A few things I spent an unreasonable amount of time on:

**Checkpoint resume.** Generating a creative video takes 10 pipeline steps. What if your network drops on step 7, or you accidentally kill the server? (I've done both.) Every completed step writes its state to a JSON file atomically — write to a temp file first, then `os.replace`, so even a hard kill won't corrupt the file. Restart the server, click "Resume" on the task, and it picks up from step 7 without re-running steps 1-6. Saves time and doesn't waste API calls.

**Audio track layout.** My first approach was to generate voiceover per scene and then concatenate. Bad idea. Every audio clip has a tiny silence at the start and end, and when you chain them together, those silences add up. The audio sounds choppy. So I switched to concatenating all the video first, then laying a single narration track across the full timeline. Much better. When the narration runs longer than the video (happens often), I freeze the last frame to fill the gap.

**Chinese font rendering.** This one haunted me for a while. moviepy renders subtitles using whatever font you pick, but if that font doesn't support CJK characters, you get little boxes instead of Chinese text. I added a check: if your chosen font doesn't cover CJK, it silently falls back to a built-in Chinese font. It's not pretty, but at least you can read it.

## Getting It Running

```bash
git clone https://github.com/easyeye163/agnes-video-generator.git
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

The project is early stage. I don't want to oversell it:

Flaky network can cause occasional retry failures — usually works if you just run it again. Single scenes over 20 seconds take a while, so patience required. There's one edge case I haven't fixed: if your custom end-frame count doesn't match your scene count, the behavior is undefined (it'll probably crash — don't ask how I know). And running multiple video generation tasks at the same time can get sluggish.

But the core generation pipeline works reliably. I use it regularly without issues.

## That's About It

I built this because I didn't want to pay. AI video is genuinely interesting, but per-second billing makes the cost of experimentation too high. You end up not trying ideas because they'd cost money. Since there are free models available, I put together a toolchain so anyone can play around with AI video without watching a meter tick.

It's MIT-licensed and all the code is on [GitHub](https://github.com/easyeye163/agnes-video-generator). Official website: [video.lichuanyang.top](https://video.lichuanyang.top/). Issues and PRs welcome.

It's free. Give it a shot — worst case you waste ten minutes.
