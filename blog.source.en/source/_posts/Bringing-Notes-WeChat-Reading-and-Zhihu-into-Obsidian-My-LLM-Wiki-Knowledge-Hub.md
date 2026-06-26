---
title: Bringing Notes, WeChat Reading, and Zhihu into Obsidian: My LLM-Wiki Knowledge Hub
date: 2026-06-26 16:18:13
categories: [Tech Talk]
tags: [Obsidian, llm-wiki, knowledge-management, WeChat-Reading, Zhihu, AI, Notion]
abbrlink: 18804
---

A while back, I came across Andrej Karpathy's llm-wiki concept and felt an instant sense of resonance. I've always enjoyed writing things down, but the problem was that everything ended up scattered across different places, and I never had the energy to manage it properly. When I discovered llm-wiki, I realized — all that stuff I'd been writing over the years was finally going to pay off.

<!-- more -->

First, what is llm-wiki?

llm-wiki is a concept recently proposed by Andrej Karpathy: take all the written material you've accumulated over the years — notes, blog posts, reading highlights, work logs — treat it as a "corpus," and let an LLM automatically extract concepts, create pages, and weave cross-references into a structured, continuously evolving personal wiki.

The core premise is simple: everyone produces a substantial amount of structured, insightful writing in their daily work and learning — it's just scattered everywhere with no connections. llm-wiki uses an LLM-driven process to string these scattered pearls together. You keep producing and collecting content; the LLM handles the organization and management.

Unlike traditional manual wiki maintenance — creating pages, writing summaries, adding links, tedious and hard to sustain — llm-wiki brings the organizational cost down to nearly zero. You just tell the LLM the structure and rules of your knowledge base (an AGENTS.md file), and it can repeatedly execute ingestion, updating, and auditing operations. My personal experience: watching an AI turn scattered notes into a structured network of cross-references feels like clearing out a long-overdue debt.

The first thing I did was export all my Notion notes — development knowledge, investing insights, and countless miscellaneous records — and move them into Obsidian.

**How to Import Notion Content into Obsidian**

The process is straightforward:

1. **Export your Notion data**: Go to "Settings & members → Settings" in Notion, select "Export all workspace content," and choose **Markdown & CSV** as the format. You'll get a ZIP file; after unzipping, each Notion page becomes a `.md` file, and databases come with additional CSV files. Note: Notion's free plan exports one workspace at a time — if you have multiple workspaces, export them separately.

2. **Install the Obsidian Importer plugin**: Search for "Importer" in the Obsidian community plugin marketplace. It supports one-click import from Notion, Bear, Evernote, OneNote, and more, handling image attachments and internal links automatically. After enabling the plugin, press `Cmd+P`, search for "Importer: Open Importer," select the Notion format, and point it to the unzipped folder.

3. **Manual import (fallback)**: If you prefer not to use the Importer plugin, just drop the unzipped folder directly into your Obsidian vault. Obsidian natively supports `[[wiki-link]]` internal links, and Notion's exported Markdown typically already converts links to this format.

4. **Post-import handling**: I recommend placing the original files in a dedicated subdirectory (e.g., `raw/notion-export/`) and marking them as "read-only." This preserves the integrity of the original data — a key tenet of the llm-wiki methodology: raw materials are never modified; the LLM builds structured knowledge on top of them. If your Notion had databases, keep the CSV files for reference; embedded Notion-specific blocks (calendars, kanban boards) will lose interactivity after export, but the text content remains.

After the whole process, thousands of scattered notes were consolidated into Obsidian, becoming the first batch of "raw materials" for my knowledge hub.

Next, I fed Karpathy's gist to an AI and had it generate the project's AGENTS.md document. The AI naturally figured out the ingestion and auditing operations required for llm-wiki.

Then it was time to execute. Watching the AI continuously generate wiki content, categorizing years of accumulated material — it was genuinely satisfying.

After that, I did a few more things: bringing in my Zhihu writings and WeChat Reading notes. I've written over a thousand answers on Zhihu, and over the years I've read more than a hundred books on WeChat Reading. Beyond just highlights, these are significant components of my knowledge system. Coincidentally, around that time, WeChat Reading released their official skill, so I put it to use.

**How to Sync Zhihu Writings to Obsidian**

Zhihu doesn't provide an official data export API, so I used Playwright for browser automation. The script launches a Chromium browser, you log in once by scanning a QR code or entering your password, and then it automatically crawls your profile page to capture all answers, articles, and status updates. The login state is persisted locally, so subsequent runs use the `--reuse` flag for silent execution without re-login. Synced files are organized by content type, and each run only incrementally fetches new content — existing files are never reprocessed.

**How to Sync WeChat Reading Notes to Obsidian**

WeChat Reading is quite developer-friendly in this regard — it provides an Agent API Gateway (`i.weread.qq.com/api/agent/gateway`), and you just need to apply for an API key to get started. My sync script first calls the `/user/notebooks` endpoint to get the list of books with notes, then fetches highlights and annotations for each new book, grouping them by chapter into well-formatted Markdown files. The output looks roughly like: book title and author as the heading, each chapter's highlights in blockquote format (with dates), and personal annotations placed below the corresponding highlights. The entire process is incremental — the script maintains a state file of synced book IDs, only processing new additions on each run. Over 150 books' worth of notes silently flowed into Obsidian, becoming one of the richest sources of raw material for my knowledge hub.

At this point, the content layer was essentially ready. Then I started thinking: since most of my knowledge and creative output is here, could I start distilling... myself?

I built a simple first version: a "personal" pipeline parallel to the wiki pipeline, with similar ingestion and linting operations. The key difference: wiki focuses on knowledge, while personal focuses on who I am as an individual.

Here it's worth explaining the difference between a "knowledge base" and "personality distillation" — they share the same set of raw materials but have entirely different goals and outputs.

**A knowledge base (Wiki) answers "what do I know?"** It extracts objective knowledge from your notes, blogs, and reading highlights, generating concept pages (e.g., "distributed consensus"), entity pages (e.g., "Raft algorithm"), source summary pages (e.g., "Designing Data-Intensive Applications — reading notes"), and builds dense cross-references between them. The goal of the wiki layer is to make knowledge queryable and reusable — an externalized second brain.

**Personality distillation (Personal Model) answers "who am I?"** It reverse-engineers cognitive patterns, expressive styles, and value orientations from your writing and reading. For instance, analyzing your technical blog posts might reveal a style of "thesis-first, case-driven, targeting intermediate-to-advanced readers." Analyzing your Zhihu answers might uncover recurring cognitive traits like "first-principles reduction" and "quantitative thinking." The output of personality distillation isn't knowledge entries — it's a cognitive map of a person: what you're good at, how you approach problems, what you value.

Both processes are structurally similar — ingestion, querying, consistency checks (linting) — but one looks outward, structuring and organizing the knowledge you possess; the other looks inward, distilling and modeling your cognitive traits as an individual. This "two sides of the same coin" design is, I think, the most fascinating part of the entire system.

Lately I've been looking at projects like Nüwa online to see if there are better approaches to personality distillation.

That's the recent story of my knowledge hub. If you have thoughts or ideas, I'd love to hear them.
