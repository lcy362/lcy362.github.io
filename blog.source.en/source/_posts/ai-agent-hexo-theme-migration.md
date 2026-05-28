---
title: Automating Hexo Theme Migration with AI Agent: From Next to Butterfly
tags:
  - AI
  - AI Agent
  - hexo
  - blog
  - automation
  - LLM
  - developer-tools
  - prompt-engineering
date: 2026-05-28 22:00:00
---

## The Problem: A Tedious Task No One Wants to Do

Recently, I decided to migrate my Hexo blog from the Next theme to Butterfly. Sounds simple, right?

If you've ever done a Hexo theme migration, you know it's anything but simple:

1. **Config files are 1000+ lines long**, requiring line-by-line comparison between old and new theme formats
2. **Feature mapping is complex**: Next's `leancloud_visitors` maps to Butterfly's `busuanzi`, Next's `reading_progress` maps to Butterfly's `preloader`
3. **Two sites need syncing**: Both Chinese and English sites need updates, with slightly different configs
4. **Font Awesome version conflicts**: Butterfly defaults to FA 7.1.0, which doesn't exist on cdnjs
5. **YAML format sensitivity**: Indentation and line endings can break everything

Manually, this would take an entire day and be error-prone. So I tried something different: **letting an AI Agent handle the entire task**.

## The Solution: AI Agent-Driven Migration

I used **Hermes Agent**, an AI-powered development assistant, to automate the entire migration process.

### What the AI Agent Did

The AI Agent autonomously completed these steps:

1. **Environment Analysis**: Checked current Hexo version (7.0.0), Node.js version (v24.14.0), and config differences between two sites
2. **Version Research**: Queried GitHub API for the latest Hexo version (8.1.2) and breaking changes
3. **Dependency Upgrade**: Batch-updated hexo and all plugins to latest versions
4. **Theme Comparison**: Analyzed feature coverage between Next and Butterfly, generating a comparison table
5. **Config Migration**: Mapped 1000+ lines of Next config to Butterfly format
6. **Bug Detection**:
   - Discovered FA 7.1.0 returns 404 on cdnjs, downgraded to 6.7.2
   - Found Zhihu icon needs `fab` prefix (brand icon)
   - Detected English site menu path error
   - Recovered lost GA, Baidu Analytics, and site verification configs
7. **Testing**: Build tests, local preview server, HTML output verification
8. **Code Commits**: Auto-generated commit messages and pushed to GitHub

### Key Technical Insights

#### 1. Font Awesome Version Compatibility

This was the most subtle bug. Butterfly's `plugins.yml` configured FA 7.1.0:

```yaml
fontawesome:
  name: '@fortawesome/fontawesome-free'
  version: 7.1.0
```

But this version doesn't exist on cdnjs! All brand icons (GitHub, StackOverflow, Zhihu) failed to load.

The AI Agent diagnosed this by:
- Inspecting generated HTML, finding FA 7.1.0 reference
- Querying cdnjs API, confirming 404 for version 7.1.0
- Testing FA 6.7.2, verifying all required icons exist
- Overriding CDN address in config

#### 2. YAML Config Migration Pitfalls

Hexo config files use YAML format, which is sensitive to indentation and line endings:

- **CRLF vs LF**: Butterfly's default config uses CRLF line endings, causing sed pattern matching to fail
- **Duplicate keys**: The patch tool created duplicate `scroll_percent` entries
- **Lost values**: Incorrect YAML indentation caused config values to not be written

These issues were resolved by using Python to directly manipulate file content.

#### 3. Multi-Site Synchronization

The Chinese and English sites share most config, but have key differences:
- English site needs `language: en`
- English site menu needs to point to Chinese site
- English site Valine placeholder needs English text

The AI Agent automatically identified and handled these differences.

## Results Comparison

| Metric | Manual | AI Agent |
|--------|--------|----------|
| Time | 4-8 hours | 30 minutes |
| Error Rate | High (easy to miss configs) | Low (systematic checking) |
| Debugging | Manual Google searches | Auto root cause analysis |
| Commits | Manual commit messages | Auto-generated |

## Why AI Agents Excel at This

This experience showed me why **AI Agents are perfect for tedious, repetitive work**:

### 1. Systematic Thinking

AI Agents don't work like humans who "fix things as they see them." They:
- Analyze current state first
- Create a complete plan
- Execute step by step with verification
- Fix issues as they arise

### 2. Cross-Domain Knowledge

Theme migration spans multiple technical domains:
- Hexo configuration
- Font Awesome version management
- YAML format handling
- Git workflows
- Frontend resource loading

AI Agents can freely switch between these domains, while human developers typically only master one or two.

### 3. Persistent Attention

Humans lose focus when processing 1000+ line config files, leading to oversights. AI Agents don't get tired—every config item gets checked.

### 4. Automated Verification

AI Agents don't just modify configs—they also:
- Run build tests
- Start local servers for verification
- Check HTML output
- Confirm critical configs are active

## Best Use Cases

Based on this experience, **AI Agents are ideal for**:

1. **Config Migration**: Converting configs between different systems
2. **Dependency Upgrades**: Batch-updating multiple packages with compatibility handling
3. **Code Refactoring**: Large-scale code format adjustments
4. **Documentation**: Integrating information from multiple sources
5. **Environment Setup**: New project initialization

## Limitations

AI Agents have limitations too:

1. **Creative Work**: UI design, copywriting still need human direction
2. **Business Decisions**: Whether to upgrade, which theme to choose—these need human judgment
3. **Complex Debugging**: Some runtime issues require human intervention

## Conclusion

This practice of using an AI Agent to complete Hexo theme migration made me see the huge potential of **LLMs (Large Language Models) in software engineering**.

AI Agents don't replace developers—they enhance our capabilities. They free us from tedious, repetitive work so we can focus on more valuable things.

If you have similar "grunt work," try letting an AI Agent help. You'll find that **AI-assisted development** is not the future—it's the present.

## Tech Stack

- **AI Agent**: Hermes Agent
- **LLM**: DeepSeek V4 Pro / MiMo v2.5
- **Static Site Generator**: Hexo 8.1.2
- **Theme**: Butterfly 5.5.4
- **Icon Library**: Font Awesome 6.7.2
- **Comment System**: Valine (LeanCloud)
- **Analytics**: Google Analytics / Baidu Analytics

---

*This article was written with AI Agent assistance, documenting a real theme migration practice.*

Source: https://lichuanyang.top/posts/ai-agent-hexo-theme-migration/
