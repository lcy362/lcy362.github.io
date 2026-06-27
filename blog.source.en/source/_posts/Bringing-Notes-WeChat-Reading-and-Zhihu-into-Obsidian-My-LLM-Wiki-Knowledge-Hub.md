---
title: "Bringing Notes, WeChat Reading, and Zhihu into Obsidian: My LLM-Wiki Knowledge Hub"
tldr: "Build a knowledge hub with Obsidian + LLM Wiki, integrating your blog, WeChat Reading, and Zhihu"
date: 2026-06-26 16:18:13
categories: [Tech Talk]
tags: [Obsidian, llm-wiki, knowledge-management, WeChat-Reading, Zhihu, AI, Notion]
faq:
  - "Q: Is Obsidian suitable for programmers doing knowledge management?"
  - "Q: Does LLM Wiki require a GPU?"
  - "Q: What's the difference between llm-wiki and a traditional wiki?"
  - "Q: What's the difference between knowledge distillation and personality distillation?"
abbrlink: 18804
howto:
  - "Install Obsidian: Download the Obsidian client and create a Vault"
  - "Configure LLM Wiki: Create AGENTS.md with ingestion, auditing, and wiki maintenance rules"
  - "Connect WeChat Reading: Use the WeChat Reading Agent API to sync book highlights and notes"
  - "Import Zhihu: Use Playwright automation scripts to scrape Zhihu answers and articles"
  - "Integrate blog: Import blog articles into Obsidian for unified knowledge management"
---

A while back, I came across Andrej Karpathy's llm-wiki concept and felt an instant sense of resonance. I've always enjoyed writing things down, but the problem was that everything ended up scattered across different places, and I never had the energy to manage it properly. When I discovered llm-wiki, I realized — all that stuff I'd been writing over the years was finally going to pay off.

<!-- more -->

## Why a Knowledge Hub

First, what is llm-wiki?

llm-wiki is a concept recently proposed by Andrej Karpathy: take all the written material you've accumulated over the years — notes, blog posts, reading highlights, work logs — treat it as a "corpus," and let an LLM automatically extract concepts, create pages, and weave cross-references into a structured, continuously evolving personal wiki.

The core premise is simple: everyone produces a substantial amount of structured, insightful writing in their daily work and learning — it's just scattered everywhere with no connections. llm-wiki uses an LLM-driven process to string these scattered pearls together. You keep producing and collecting content; the LLM handles the organization and management.

Unlike traditional manual wiki maintenance — creating pages, writing summaries, adding links, tedious and hard to sustain — llm-wiki brings the organizational cost down to nearly zero. You just tell the LLM the structure and rules of your knowledge base (an AGENTS.md file), and it can repeatedly execute ingestion, updating, and auditing operations. My personal experience: watching an AI turn scattered notes into a structured network of cross-references feels like clearing out a long-overdue debt.

## Data Ingestion

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

## Importing Zhihu Content

**How to Sync Zhihu Writings to Obsidian**

Zhihu doesn't provide an official data export API, so I used Playwright for browser automation.

**Steps**:

1. Install Playwright: `pip install playwright && playwright install chromium`
2. Run the script for the first time, log in by scanning a QR code or entering your password in the opened Chromium browser
3. Once logged in, the script automatically crawls your profile to capture all answers, articles, and status updates
4. Login state is persisted locally; subsequent runs use `--reuse` for silent execution without re-login

**Features**: Incremental sync — only fetches new content, existing files are never reprocessed. Files are organized by content type (answers/articles/pins).

## Syncing WeChat Reading Notes

**How to Sync WeChat Reading Notes to Obsidian**

WeChat Reading provides an Agent API Gateway — apply for an API key and you're good to go.

**Steps**:

1. Call the `/user/notebooks` endpoint to get the list of books with notes
2. For each new book, fetch highlights and annotations separately
3. Group content by chapter and output as well-formatted Markdown files

**Output format**: Book title and author as the heading, each chapter's highlights in blockquote format (with dates), personal annotations placed below the corresponding highlights.

**Features**: Fully incremental — the script maintains a state file of synced book IDs, only processing new additions on each run. Over 150 books' worth of notes silently flowed into Obsidian, becoming one of the richest sources of raw material for my knowledge hub.

## Intelligent Retrieval with LLM Wiki

At this point, the content layer was essentially ready. Then I started thinking: since most of my knowledge and creative output is here, could I start distilling... myself?

I built a simple first version: a "personal" pipeline parallel to the wiki pipeline, with similar ingestion and linting operations. The key difference: wiki focuses on knowledge, while personal focuses on who I am as an individual.

**Knowledge Base vs. Personality Distillation: Two Different AI Processing Approaches**

Here it's worth explaining the difference — they share the same set of raw materials but have entirely different goals and outputs.

**Knowledge Base (Wiki): Answers "What Do I Know?"**

Extracts objective knowledge from notes, blogs, and reading highlights, generating concept pages (e.g., "distributed consensus"), entity pages (e.g., "Raft algorithm"), and source summary pages (e.g., "Designing Data-Intensive Applications — reading notes"), with dense cross-references between them. The goal: make knowledge queryable and reusable — an externalized second brain.

**Personality Distillation (Personal Model): Answers "Who Am I?"**

Reverse-engineers cognitive patterns, expressive styles, and value orientations from your writing and reading. For example, analyzing technical blog posts might reveal a "thesis-first, case-driven" style; analyzing Zhihu answers might uncover recurring traits like "first-principles reduction" and "quantitative thinking." The output isn't knowledge entries — it's a cognitive map of a person: what you're good at, how you approach problems, what you value.

**Comparison**

| Dimension | Knowledge Base | Personality Distillation |
|-----------|---------------|-------------------------|
| Core question | What do I know? | Who am I? |
| Input | Notes, blogs, reading highlights | All personal writing and reading records |
| Output | Concept/entity/source pages + cross-references | Domain depth, cognitive traits, expressive style, values |
| Direction | Outward: structuring external knowledge | Inward: modeling personal cognition |
| Workflow | Ingest → Query → Lint → Audit | Ingest → Query → Lint → Audit (isomorphic) |

Both processes are structurally similar, but one looks outward, structuring and organizing the knowledge you possess; the other looks inward, distilling and modeling your cognitive traits as an individual. This "two sides of the same coin" design is, I think, the most fascinating part of the entire system.

Lately I've been looking at projects like Nüwa online to see if there are better approaches to personality distillation.

## Results and Reflections

That's the recent story of my knowledge hub. If you have thoughts or ideas, I'd love to hear them.

## Frequently Asked Questions

### Q: Is Obsidian suitable for programmers doing knowledge management?

Absolutely. Obsidian's core philosophy — local Markdown files, bidirectional links, graph visualization — naturally aligns with how programmers work. You already know Markdown syntax. Local file storage means full data control and Git versioning. Bidirectional links let you manage knowledge references just like code dependencies. Layer on the llm-wiki approach, and AI can automatically extract concepts from scattered notes, create pages with cross-references, transforming loose documents into a structured knowledge network.

### Q: Does LLM Wiki require a GPU?

No local GPU deployment is needed. The core idea of LLM Wiki is **letting an LLM process your text**, not running a model yourself. You simply call a cloud LLM API, feed it your Markdown files, and let it extract concepts, generate pages, and build cross-references. The entire "hardware" requirement is just Obsidian plus any tool that can call an LLM API (like WorkBuddy or another Agent).

### Q: What's the difference between llm-wiki and a traditional wiki?

A traditional wiki requires you to manually create pages, write summaries, and add internal links — high maintenance cost that's hard to sustain. llm-wiki reduces the organizational cost to nearly zero — you just keep producing and collecting written content, and the LLM reads your AGENTS.md rules, repeatedly running ingestion, updating, and auditing operations to generate a structured cross-reference network. In short: a traditional wiki means "you organize knowledge"; llm-wiki means "AI organizes knowledge for you."

### Q: What's the difference between knowledge distillation and personality distillation?

Both share the same set of raw materials, but their goals and outputs are entirely different. **Knowledge Base (Wiki)** answers "What do I know?" — extracting objective knowledge from notes and reading highlights, generating concept pages and cross-references. **Personality Distillation (Personal Model)** answers "Who am I?" — reverse-engineering your cognitive patterns, expressive style, and value orientations from your writing and reading records. One looks outward (structuring knowledge), the other looks inward (modeling personal cognition). The workflows are similar, but the direction is opposite.

## Quick Start Guide

1. **Install Obsidian**: Download the client from [obsidian.md](https://obsidian.md) and create a local Vault — just a local folder.
2. **Configure LLM Wiki**: Create `AGENTS.md` in the Vault root, following Karpathy's llm-wiki approach to define maintenance rules, including ingestion, updating, and auditing workflows. Let AI tools read this file to automatically extract concepts and build cross-references from raw notes.
3. **Import Notion notes**: Export from Notion settings as Markdown + CSV, use the Obsidian Importer plugin for one-click import, or drop the extracted Markdown folder directly into the Vault.
4. **Connect WeChat Reading**: Apply for a WeChat Reading API key, call the `/user/notebooks` endpoint to fetch books, pull highlights and notes, group by chapter, and output as Markdown files into the Vault.
5. **Import Zhihu and blog**: Use a Playwright script to auto-scrape Zhihu answers and articles; copy blog Markdown source files into the Vault. Once done, run a full wiki ingestion via AI to generate the complete cross-reference network.

Source: https://lichuanyang.top/posts/18804/
