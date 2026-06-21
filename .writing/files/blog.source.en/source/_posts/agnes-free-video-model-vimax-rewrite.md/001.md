---
title: 'Agnes Free Models: I Rewrote ViMax to Generate AI Videos for $0'
description: >-
  Agnes AI released free video models including Agnes-Video-V2.0 — no GPU, no credit card needed. I rewrote the open-source ViMax framework into a full Agnes pipeline with major usability improvements.
keywords:
  - agnes
  - agnes free model
  - agnes video
  - Agnes-Video-V2.0
  - AI video generation
  - free AI video
  - ViMax
categories:
  - AI Practice
tags:
  - agnes
  - agnes free model
  - agnes video
  - Agnes-Video-V2.0
  - AI video generation
  - free AI models
  - open source
  - ViMax
abbrlink: 65500
cover: /img/65500.jpg
date: 2026-06-11 22:00:00
---

A while back, I wrote about "token hunting" — the practice of bouncing between free AI models instead of paying for subscriptions. At the time, free models mostly meant text and maybe some image generation. Then Agnes AI quietly dropped something unexpected: **free video generation models.**

Not text. Not images. Video. Three models — `agnes-video-v2.0`, `agnes-image-2.1-flash`, and `agnes-2.0-flash` — all free, no credit card, no GPU, just an API key. Among free agnes video generation solutions, Agnes-Video-V2.0 stands out as the most capable, supporting multiple generation modes with impressive output quality.

Naturally, I couldn't resist. I took the open-source ViMax framework and rebuilt it as a full Agnes-powered pipeline, with a bunch of usability improvements along the way.

<!-- more -->

## What Agnes Free Models Actually Give You

Let's start with what's on the table. After [signing up at Agnes AI](https://platform.agnes-ai.com), you get an API key that unlocks three models:

- **agnes-2.0-flash** (Chat): Writes stories, scripts, and visual prompts from a single idea
- **agnes-image-2.1-flash** (Image): Text-to-image for character references and keyframes
- **agnes-video-v2.0** (Video): Supports text-to-video, image-to-video, and keyframes modes

The API follows the OpenAI-compatible format at `https://apihub.agnes-ai.com/v1`, making integration straightforward. The video model is async — submit a task, get a task_id, poll for results. Standard stuff for cloud video generation.

The real kicker: **these three models cover the entire pipeline from idea to finished video.** No mixing providers, no juggling multiple API keys. One key, one base URL, done.

## The Rewrite: From Multi-Provider to Single Agnes Key

The original ViMax, open-sourced by HKU, is a well-designed agentic video generation framework. It's intentionally provider-agnostic — one service for LLM, another for images, yet another for video. Flexible, yes, but you end up managing three sets of credentials, three error handlers, three rate limit strategies.

My approach was simple: **since all three Agnes models are free, just use Agnes for everything.** One API key, one base URL, minimal headache.

Here's what changed:

**Screenwriter module**: All LLM calls now hit `agnes-2.0-flash`. It takes a one-line idea and produces a full story, breaks it into scenes, writes visual prompts for each scene, and generates end-frame descriptions. Standard chat/completions endpoint, temperature 0.7.

**Image generator**: Switched to `agnes-image-2.1-flash` for text-to-image and `agnes-image-2.0-flash` for image-to-image. The newer 2.1 model generates character reference images; the older 2.0 handles scene transition frames.

**Video generator**: The core — `agnes-video-v2.0`. Supports three modes: pure text-to-video (t2v), image-guided video (ti2vid), and keyframe interpolation (keyframes). Each scene supports 5 to 20 seconds at 24fps.

After the rewrite, the entire project depends on a single API provider. Write one key in `.api_key`, and you're done.

## Usability Improvements: Don't Make Users Think

The original ViMax had a very "research project" feel — parameters hardcoded in Python, changing a creative idea meant editing source code. Not great. So I did a bunch of usability work.

### YAML Creative Configs

The biggest change: YAML-based creative files. Each video idea lives in its own `.yaml` file under `creatives/`:

```yaml
name: "frog"
idea: |
  A dark twist on The Frog Prince — the princess kisses
  the frog, but instead of a handsome prince, the frog
  transforms into an even more terrifying creature
user_requirement: |
  5 scenes, 10 seconds each, gothic dark fairytale
style: "Gothic dark fairytale, cinematic quality"
chaining_mode: keyframes
video_width: 768
video_height: 1152
```

New video idea? Write a YAML, run one command, done. No touching Python source code.

### One-Click Launcher

`start.sh` wraps everything: auto-loads the API key from `.api_key`, activates the virtual environment, lists available creatives, and runs the pipeline. No arguments lists all creatives; pass a name and it just runs:

```bash
./start.sh          # list all creatives
./start.sh frog     # generate "The Frog Prince"
```

### Smart Caching and Resume

This one matters because video generation is genuinely slow.

Every intermediate result — story text, scene scripts, character reference images, per-scene videos — is persisted to disk. If the pipeline crashes halfway, re-running the same creative skips completed steps and only generates what's missing.

The caching granularity goes down to individual scene videos: if you had 5 scenes and crashed after 3, re-running only generates the remaining 2. No restart from scratch.

### Multimodal Image Analysis

You can provide your own character reference images or custom end-frame images per scene. The system analyzes them via the multimodal LLM and weaves the visual descriptions into the story and prompt generation.

For example, provide a hand-drawn cartoon character, and the system will identify its visual features and maintain consistency across all generated scenes.

## Character Consistency: Two-Stage Lockdown

The biggest pitfall in AI video generation is character consistency — your protagonist has black hair in scene one and suddenly goes blonde in scene two.

ViMax-Agnes uses a two-stage approach:

**Stage one**: Generate (or accept from the user) a character reference image. The screenwriter module extracts a detailed appearance description from the story — body type, hairstyle, clothing, color palette, distinguishing features — and feeds it to the image model to produce a full-body reference.

**Stage two**: Every scene video starts from this reference image as its first frame, generated via `ti2vid` mode. The video model animates from the same visual anchor, naturally preserving character consistency.

In practice, cartoon and stylized art styles get the best consistency. For photorealistic output, providing your own reference image works better than relying on AI generation.

## Three Scene Chaining Modes

This was the most interesting part of the rewrite. I adapted three chaining modes on top of the Agnes API:

**`none` (Independent)**: Each scene is generated independently, sharing only the character reference image. Fastest, but hard cuts between scenes — no transitions.

**`ti2vid` (Transition Frames)**: Sequential generation. After each scene, the last frame is extracted, then img2img generates a "transition frame" blending the end of one scene into the start of the next. Smoother transitions, but error accumulates — artifacts in earlier scenes propagate forward.

**`keyframes` (Keyframe Interpolation)**: The recommended mode. Each scene specifies both a first frame and a last frame, and the video model interpolates motion between them. End frames are AI-generated from scene descriptions (or manually provided). With both endpoints determined, transitions are the smoothest of the three modes.

Switching between modes is a single YAML field — no code changes needed.

## Results

I tested several creative ideas:

- **The Frog Prince**: 5-scene dark fairytale, keyframes mode, fully auto-generated
- **Girl Dunk**: 3-scene sports theme, character consistency held up well
- **Beach Dance**: 4-scene MV style, smooth scene transitions
- **Hot Spring Robot**: 3-scene cozy vibe, cartoon style had the best consistency

The main bottleneck is video generation itself — each scene takes a few minutes. But with the caching system, the debugging cost stays manageable.

## Agnes-Video-V2.0 Technical Details

For those who want to dig deeper, a few implementation notes:

**Video parameters**: Frame counts follow the `8n+1` rule with a 441-frame cap. 5 seconds = 121 frames, 10s = 241, 15s = 361, 18s and 20s = 441 (at 24 and 22 fps respectively).

**Image upload workaround**: The video API needs image URLs, not base64. Local images get "uploaded" through the image API — a no-op i2i call with `agnes-image-2.1-flash` (prompt: "keep the image exactly as it is") that returns a hosted URL. Falls back to inline base64 if the upload fails.

**Retry mechanism**: Video submissions auto-retry with exponential backoff on 429 (rate limit) and 5xx (server errors), up to 5 attempts. Polling has no timeout — video generation is just slow, and you have to wait.

**Minimal dependencies**: The entire project uses only 5 Python packages: requests, pydantic, PyYAML, moviepy, and tenacity. No PyTorch, no CUDA — it's purely an API orchestration layer.

## Wrapping Up

Agnes's free model lineup is genuinely generous. The agnes free models cover text, image, and video, with an OpenAI-compatible API format and zero signup friction. For anyone curious about AI video generation without burning money, it's a solid starting point.

The ViMax-Agnes rewrite confirmed something I'd been thinking: **when free models are good enough, the "hunt for free tokens" strategy scales seamlessly from text to video.** One API key, one command, one YAML file — from a sentence to a complete multi-scene video.

The project is open source: [github.com/lcy362/vimax-agnes](https://github.com/lcy362/vimax-agnes). Stars and issues welcome.

Source: https://lichuanyang.top/en/posts/65500/
