---

title: 'How to Farm Free Tokens: Building Agent-Independent AI Workflows'
description: >-
  After tinkering with AI Agents, I realized they're mostly just shuffling documents and prompts around. Instead of paying for subscriptions, maintain your own project docs and use whichever platform has free tokens.
categories:
  - AI Practice
tags:
  - ai-agent
  - llm
  - prompt
  - productivity
  - workflow
faq:
  - Q: What's the relationship between Agents and Skills?
  - Q: What's the most effective way to optimize token usage?
  - Q: Which is a better investment — maintaining docs or subscribing to an Agent?
  - Q: Are free models really sufficient?
abbrlink: 26060
tldr: The core of AI workflows is packaging knowledge into reusable skills, not writing prompts from scratch
date: 2026-06-03 22:00:00
top_img: /img/ai-agent-workflow.jpg
cover: /img/ai-agent-workflow.jpg

---



What's the biggest—or perhaps only—pain point of using AI right now? Probably the bill.

Claude, Codex, Cursor, Qoder, MiMo, MiniMax—their basic plans all start around $20/month, and you still have to watch your usage. If you want unlimited access, it gets even more expensive.

Meanwhile, lots of platforms offer free trials or permanently free models. For instance, OpenCode's DeepSeek Flash has been free for a while.

So how do we actually make the most of these free models?

I've been using AI Agents across a wide range of projects—code, personal blogs, knowledge bases, fiction writing, even little games I build with AI. Over time I noticed something: **every Agent operation boils down to: read your docs → assemble a prompt → send it to a model → modify files based on the result.**

The intelligence lives in your docs, not the platform. Whether you assemble the prompt yourself or let a platform do it—there's really not that much difference.

So I stopped worrying about which Agent platform to use. I maintain good docs, and wherever there are free tokens, that's where I go.

<!-- more -->

## What Agents Actually Do

Regardless of which Agent you use, the workflow is basically the same:

```
You state a need → Agent reads project docs → reads relevant files → assembles a prompt → asks the model → processes the response → modifies files → loops
```

Say you ask it to fix a bug. It will:

1. First read your `AGENTS.md` and `README.md` to understand what the project is and where things are
2. Then find the files related to the bug and read the source code
3. Assemble "project context + relevant code + bug description + fix requirements" into a single prompt
4. Send it to the LLM
5. Turn the response into actual code changes

How much difference can there really be between one Agent and another, at this level?

Don't get me wrong—I'm not dismissing genuinely good Agents. The best ones really do handle context management, flow control, and tool integration smoothly. That's why they're popular. But "human intelligence" can easily bridge those gaps.

Take context management: an Agent can figure out "this bug involves the auth module, I need to read these three files"—but only because it already read your `AGENTS.md`. Those file paths, module responsibilities, and conventions? You wrote them in there yourself.

When your docs are messy, a good Agent can find information more efficiently. But with well-organized docs, the differences between Agents become negligible.

Bottom line: good Agents are genuinely convenient in some scenarios, but they're not worth the price. Saving a few minutes on doc maintenance and window-switching in exchange for tens or hundreds of dollars a month? Terrible ROI.

For me personally, maintaining a solid Agent guide is far more cost-effective. Besides, you can totally have AI write those guide documents for you.

## Documentation Is the Key

Once you accept the above, you have to face a counterintuitive fact: **what's truly valuable isn't the Agent platform—it's your own workflow.**

Anyone can call an LLM. Most Agent platforms are just orchestration layers with similar features. But your project docs and process management are unique—they record your project structure, design decisions, pitfalls you've hit, and your preferred coding style.

Same docs on a different platform? The results are basically the same. But garbage docs? No platform can save you.

Here's how I maintain docs for code projects:

- Project overview doc: tech stack, directory structure, key module descriptions
- Workflow docs: "how to add a feature", "bug fix steps", "release process"
- Rule docs: naming conventions, comment requirements, lessons learned

Same project directory, opened with different Agents—barely any difference in results.

Same goes for fiction projects. World-building, character profiles, chapter outlines, writing guidelines—keep these docs consistent, and you'll get consistent style across different models. **The docs set the shape; the content quality follows.**

Even at the model layer, the differences aren't that big. DeepSeek V4 Flash handles the vast majority of tasks just fine.

If you really want to spend money to save time, invest in the documentation itself—not in choosing the "right" platform.

## Token Farming in Practice

Once your workflow lives in docs, the biggest benefit kicks in: you can switch platforms freely.

Whichever platform has free tokens, use it. When it runs out, move to the next.

Here are some I use:

- **OpenCode**: Free DeepSeek Flash daily
- **Qoder**: Some trial credits for new users, plus free model quotas
- **Codex**: Trial bundle—honestly, I still haven't gotten around to using it. I keep thinking I'll save the free quota for a genuinely complex task, but those tasks never actually come up.
- **Hermes**: Occasionally releases free models. Sometimes you luck into a great one—like when they had free DeepSeek Flash a while back.
- **Trae**: Completely free, just need to queue. When a task really feels too much for the free models, I hop over to Trae temporarily. Works perfectly fine.

Other avenues worth exploring:

- **LLM API new-user credits**: OpenAI, Anthropic, DeepSeek, etc. New accounts usually come with a few dollars. Calling the API directly is cheaper than going through an Agent platform.
- **Free hosting for open-source models**: HuggingFace, Together AI offer free inference quotas. More than enough for small tasks.
- **Student discounts**: GitHub Student Pack and the like come with a bunch of platform credits.
- **Community events**: AI platforms often give away credits through events.

## Conclusion

The takeaway is simple: **Agents are just tools. Documentation is the core.** Maintain your docs well, and you can switch platforms at will, farming free tokens wherever they pop up. Saving tens of dollars a month—that's a nice hotpot dinner right there.

As for those burning through hundreds of dollars in tokens every month—hey, your money is well spent. But my tokens cost nothing, and the results are about the same.

Source: https://lichuanyang.top/en/posts/26060/

## Frequently Asked Questions

### Q: What's the relationship between Agents and Skills?

An Agent is the "worker" executing tasks; a Skill is the "instruction manual" telling it how. The Agent's underlying model provides general reasoning ability, but it doesn't know your project structure, coding conventions, or API design constraints — that knowledge must be communicated through Skills (structured instruction documents). The relationship can be understood as: Agent = General Reasoning Engine + On-Demand Skill Loading. If you maintain your Skills well, you can switch between different Agent platforms and still get consistent output quality.

### Q: What's the most effective way to optimize token usage?

Not switching to cheaper models — it's **writing better docs**. A well-crafted AGENTS.md or SKILL.md allows the Agent to precisely locate the files it needs, avoiding a full project scan for every task. In comparison, tweaking model choices or prompt phrasing on top of poor documentation saves far fewer tokens than good documentation would. Invest time in clear docs first, then farm free tokens — that's the highest-ROI path.

### Q: Which is a better investment — maintaining docs or subscribing to an Agent?

Maintaining docs is the better investment. An Agent subscription costs tens to hundreds of dollars a month, essentially paying for the platform's convenience of "finding files, assembling prompts." But if your project docs are already comprehensive — tech stack, directory structure, design decisions, coding conventions all spelled out — switching to a free Agent yields almost identical results. Docs are your asset, reusable across platforms. An Agent subscription is a consumable — switch platforms and you start over.

### Q: Are free models really sufficient?

For the vast majority of daily tasks, yes. The author's experience shows that DeepSeek Flash-level free models can handle most code modifications, document generation, and knowledge organization tasks. When you encounter genuinely complex scenarios beyond their reach, you can temporarily switch to platforms with free trial credits (like Trae, Codex trial bundles). The real bottleneck is rarely model capability — it's whether the context (docs) you feed it is good enough.
