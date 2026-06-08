---
title: Using LLM to Manage Security Development Standards - An llm-wiki Practice
categories:
  - AI Practice
tags:
  - llm
  - knowledge-management
  - security-standards
  - wiki
  - practice
description: How to use LLM to manage team security development standards, based on Karpathy's llm-wiki approach to solve scattered documentation problems.
abbrlink: 64
cover: /img/64.png
date: 2026-05-11 15:38:16
---

When I was organizing our team's security development standards recently, I encountered an old problem: security documentation keeps piling up, but when you actually need it, you can't find it. Every time a new team member joins, they have to dig through various documents to piece together the complete security standards. Every time we have a security incident, the lessons learned are scattered everywhere, and we end up rediscovering the same issues next time.

I've tried managing this with Confluence, Notion, even Git repository READMEs, but none worked well. It wasn't until I saw Karpathy's llm-wiki concept that I thought this might be a breakthrough approach.

<!-- more -->

## What is Karpathy's llm-wiki?

Karpathy proposed an idea in his [Gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f): let LLMs maintain a Wiki middleware layer. His exact words were "the wiki is a persistent, compounding artifact" - this Wiki layer acts like a compiler, compiling raw documents into structured data. This way, when the LLM answers questions, it doesn't need to search through raw documents from scratch; it can directly query the Wiki.

I think this approach is brilliant. Traditional document management is about "storing" and "finding", while llm-wiki is about "compiling" and "querying". Raw documents might be messy, duplicated, or even contradictory, but the Wiki layer is clean, structured, and cross-referenced.

For example: our team has over a dozen security development standard documents, covering everything from input validation to penetration testing, plus nearly ten security incident post-mortem reports. These documents come in different formats - some in Word, some in Markdown, some are even just Slack chat exports. If we let the LLM process these raw materials directly, efficiency would be very low. But if we first "compile" them into a Wiki, the results are completely different.

## My Implementation Process

### Step 1: Generate CLAUDE.md

I first gave Claude Karpathy's Gist link and asked it to generate a CLAUDE.md file based on this concept. This file serves as an "operation manual" for the LLM, telling it how to maintain the Wiki.

The generated CLAUDE.md contained several key sections:
- Three-layer architecture explanation (raw → wiki → output)
- Wiki page specification (frontmatter format, cross-reference rules)
- Ingestion workflow (how to process new materials)
- Query workflow (how to answer user questions)
- Lint checks (how to maintain Wiki health)

In practice, I found the model's output was basically usable without much fine-tuning. I also had the AI generate the output layer for final specification documents. This completed the three-layer architecture: raw for original materials, wiki for structured Wiki, output for final output.

### Step 2: Collect and Organize Raw Materials

This was the most time-consuming step. I collected all the scattered security development standards and incident cases, placing them uniformly in the raw/sources/ directory. To preserve the original state, I didn't modify the content or unify the formats - PDF, Word, PPT, Markdown, and other formats can all go directly into the raw layer; the model can handle them all.

Specifically, I collected:
- Over a dozen security development standard documents: covering input validation, SQL injection prevention, XSS prevention, CSRF prevention, sensitive data protection, log security, etc.
- Nearly ten security incident post-mortem reports: including SQL injection vulnerabilities, unauthorized access, sensitive information leaks, session hijacking, and other real cases
- Several security architecture documents: covering zero-trust architecture, secure coding guidelines, penetration testing processes, etc.

The quality of these materials varied greatly. Some were well-formatted with clear headings and lists; others were rough notes, even screenshots. But that's fine - the beauty of llm-wiki is that it can handle this kind of "dirty data".

### Step 3: Let the LLM Generate the Wiki Layer

With CLAUDE.md and raw materials ready, I could let the LLM start working. I used Claude here, mainly because its context window is large enough to process more content at once.

The process works like this:
1. Use CLAUDE.md as the system prompt
2. Tell the LLM: "Please process all materials in the raw/sources/ directory according to the CLAUDE.md specification and generate the wiki layer"
3. The LLM reads each raw file sequentially, extracts key information, and generates corresponding Wiki pages

This process isn't complete in one go. The LLM's initial Wiki has issues:
- Cross-references are insufficient
- Some concepts aren't extracted into standalone pages
- Logical relationships between pages aren't clear enough

So multiple iterations are needed. I review the generated Wiki, point out issues, and let the LLM fix them. For example:
"This incident case mentions 'improper connection pool configuration', but why isn't there a corresponding concept page? Please create a [[connection-pool-best-practices]] page and reference it in the incident case."

After 5-6 iterations, the Wiki layer gradually took shape.

### Step 4: Generate Final Specification Documents

With the Wiki layer ready, I could generate the final specification documents. I asked the LLM to generate a developer-facing, directly readable specification document based on the Wiki layer.

Here's a design decision: the final document goes in the output/ directory, not modifying the original materials. This maintains the clarity of the three-layer architecture:
- raw/: original materials, unmodifiable
- wiki/: structured Wiki, maintained by LLM
- output/: final output, for human reading

The generated specification documents have several characteristics:
1. Each standard entry includes "why" - not just "do this", but also "why do this"
2. Related incident cases are linked as "negative examples" alongside
3. Cross-references exist, for example "database connection pool configuration" links to the "connection pool best practices" concept page

## Actual Results

### Reading Experience

The final specification documents can be opened directly in Obsidian. Being in Markdown format, they support:
- Code block syntax highlighting
- Internal link navigation (click to jump to related concepts or incident cases)
- Tag filtering (e.g., filter all #security-related standards)

More importantly, each security standard is linked to real incident cases. For example, next to the "SQL Injection Prevention" standard, there's a link to the [[sql-injection-vulnerability-incident]] case, which details how the vulnerability occurred, what impact it had, and how it was fixed. This way developers not only know "what to do" but also see "what happens if you don't do it".

Compared to the previous scattered documents, the reading experience improved by orders of magnitude.

### LLM Q&A

Even more powerful is the LLM's Q&A capability. Because of the Wiki layer, the LLM's answers are very accurate. For example, when I ask:
"What should I watch out for when doing batch database updates?"

The LLM will:
1. First find the [[batch-operation-security]] concept page in the Wiki
2. Combine it with the [[sql-injection-batch-incident]] incident case
3. Give specific recommendations: must use parameterized queries, no string concatenation for SQL, batch operations need transaction control, large batches should be paginated, etc.
4. Also explain why: because if something goes wrong with batch operations, the impact is N times that of single operations

Another example: "How should I handle user file uploads securely?"

The LLM will:
1. Find the [[file-upload-security]] concept page
2. Combine it with the [[malicious-file-upload-incident]] incident case
3. Give specific recommendations: file type whitelist validation, file content detection, rename storage, limit file size, isolated storage, etc.

This is much more reliable than letting the LLM "search" for answers in a dozen raw documents.

### Continuous Updates

What satisfied me most is the update mechanism. When new standard documents or incident reports arrive, I just need to:
1. Place the new file in the raw/sources/ directory
2. Tell the LLM: "There are new materials to ingest"
3. The LLM automatically updates the Wiki layer and specification documents

For example, last week we had a new security incident: an XSS vulnerability due to unfiltered user input. After I placed the incident report in the raw directory, the LLM automatically:
1. Created the [[xss-user-input-incident]] incident case page
2. Updated the [[input-validation-security]] concept page with XSS-related notes
3. Added relevant entries to the "Input Validation Standards" section of the specification document

## Problems Encountered and Solutions

### Problem 1: Unstable Wiki Quality from LLM

At first, the LLM-generated Wiki quality varied greatly. Sometimes it extracted key information well, sometimes it missed important content.

**Solution**: I refined the Wiki page specification in CLAUDE.md. For example, I required each page to have:
- Summary line: one sentence describing the core content
- Tags line: mark topics with #tags
- Clear page type (concept/entity/source/comparison)

For security incident cases, I also required: vulnerability type, attack vector, impact scope, fix solution, prevention measures. This gave the LLM clearer guidance, and generation quality became much more stable.

### Problem 2: Cross-References Frequently Break

The core value of Wiki lies in cross-references, but the LLM often creates one-way links or links to non-existent pages.

**Solution**: I strengthened cross-reference rules in CLAUDE.md:
1. Must be bidirectional: if page A references [[B]], then page B must also reference [[A]]
2. The related field in frontmatter must match the [[wiki-links]] in the body
3. Can only reference existing pages; must create before referencing

I also added Lint checks to regularly check for broken links and orphan pages.

### Problem 3: Low Efficiency Processing Unstructured Materials

Some raw materials are poor quality, like screenshots, handwritten notes, or even Slack chat exports. The LLM processes these materials inefficiently.

**Solution**: For these materials, I first manually organize them into structured Markdown, then hand them to the LLM. Although this increases upfront workload, it ensures final quality.

## Lessons Learned

1. **Don't aim for perfection in one shot**. llm-wiki is an iterative process. The first version of the Wiki won't be perfect, but it can be improved through continuous iteration.

2. **Keep optimizing CLAUDE.md**. As you use it, you'll discover missing rules in CLAUDE.md. For example, I later added structural requirements like "security incident cases must include: vulnerability type, attack vector, impact scope, fix solution, prevention measures."

3. **Keep the three-layer architecture pure**. raw/ is raw/, don't modify it; wiki/ is maintained by LLM; output/ is for humans. Mixing them together will only get messier.

4. **Do regular health checks**. I run Lint weekly to check for broken links, orphan pages, one-way links, etc. Fix problems as soon as they're found.

5. **Accept imperfection**. The LLM-generated Wiki won't be 100% accurate; there will be omissions and errors. But compared to completely manual maintenance, it's already much better.

## Conclusion

Using llm-wiki to manage security development standards essentially transforms "document management" into "knowledge engineering". Raw documents are "raw materials", Wiki is "semi-finished products", and specification documents are "finished products". The LLM serves as both "compiler" and "maintainer" in this process.

The greatest value of this approach is **sustainability**. Traditional document management eventually gets abandoned because maintenance costs are too high. llm-wiki shifts maintenance costs to the LLM, and humans only need to:
1. Provide raw materials (this can't be avoided)
2. Review and correct the LLM's work (much easier than writing from scratch)
3. Use the final output (enjoy the results)

If you're also struggling with managing security development standards, give this approach a try. You don't need to copy my implementation exactly; the key is understanding the core concept of "Wiki middleware layer". As for which tools to use or how to organize directories, you can adjust according to your actual situation.

After all, tools exist to serve people, don't they?

Source: https://lichuanyang.top/en/posts/16495/
