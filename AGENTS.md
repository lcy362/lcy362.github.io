# AGENTS.md — Blog Project Context

## Overview

This is a **Hexo** static blog with a dual-language setup (Chinese + English), deployed to **Vercel** at `https://lichuanyang.top/`. The English site lives under `/en/`.

- **Framework**: Hexo 8.1.2
- **Theme**: Butterfly 5.5.4 (installed via npm, not git submodule)
- **Domain**: `lichuanyang.top` (Vercel, CNAME in source)
- **Repo**: `git@github.com:lcy362/lcy362.github.io.git` (master branch)

## Project Structure

```
~/blogs/
├── deploy.sh                  # Unified build & deploy script
├── blog.source/               # Chinese site (primary)
│   ├── _config.yml            # Hexo config
│   ├── _config.butterfly.yml  # Theme config (1100+ lines)
│   ├── package.json           # Dependencies
│   ├── source/_posts/         # Markdown posts (88 articles)
│   ├── source/{img,upload}/   # Static assets
│   ├── themes/                # Old themes (landscape, next, yilia) — unused
│   ├── public/                # Build output (git-ignored)
│   └── node_modules/          # Dependencies (git-ignored)
│
└── blog.source.en/            # English site (independent Hexo instance)
    ├── _config.yml            # Hexo config (different url/root/language)
    ├── _config.butterfly.yml  # Theme config (menu links differ)
    ├── package.json           # Same deps + hexo-generator-i18n
    ├── source/_posts/         # English posts (4 articles)
    └── ...                    # Same structure as CN
```

## Key Configuration Differences (CN vs EN)

| Setting | CN (`blog.source`) | EN (`blog.source.en`) |
|---|---|---|
| `url` | `https://lichuanyang.top/` | `https://lichuanyang.top/en` |
| `root` | `/` | `/en/` |
| `language` | `zh-CN` | `en` |
| `filter_optimize.enable` | `true` | `false` |
| `filter_optimize.css.bundle` | `false` | `true` (irrelevant, plugin disabled) |
| Extra plugin | — | `hexo-generator-i18n` |
| Menu "English"/"中文" | `English: /en` | `中文: https://lichuanyang.top/` |

## Deploy Script (`deploy.sh`)

Located at `~/blogs/deploy.sh`. Usage:

```bash
./deploy.sh              # Build both sites + local preview (hexo server)
./deploy.sh -d           # Build + deploy to GitHub (triggers Vercel)
./deploy.sh -c -d        # Clean build + deploy
./deploy.sh -c           # Clean build + local preview
```

### What the script does (4 steps):

1. **Build CN site**: `cd blog.source && hexo generate`
2. **Build EN site**: `cd blog.source.en && hexo generate`
3. **Merge**: `cp -r blog.source.en/public/. blog.source/public/en/`
4. **Deploy/serve**: `hexo deploy` (git push to master) or `hexo server`

### Critical: the merge step

EN site's `public/` contents are copied into CN's `public/en/`. This works because:
- EN's `root: /en/` makes HTML reference `/en/css/index.css`, `/en/js/main.js`, etc.
- EN's build puts files at `public/css/index.css`, `public/js/main.js` (root-relative)
- After copy into `CN/public/en/`, paths align: `CN/public/en/css/index.css` matches `/en/css/index.css`

**Do NOT change EN's `root` to `/`** — it will break CSS/JS paths. See "Pitfalls" below.

## Theme Configuration (`_config.butterfly.yml`)

Key settings in the ~1100-line Butterfly config:

- **Menu**: Defined in `menu:` section, format: `Label: /path || icon-class`
- **Dark mode**: Enabled with toggle button (`darkmode.enable: true`)
- **Preloader**: Pace progress bar (`preloader.source: 2`)
- **Search**: Local search (`search.use: local_search`)
- **Comments**: Valine (LeanCloud)
- **Analytics**: Baidu + Google Analytics
- **Ads**: Google AdSense enabled
- **Font Awesome**: 6.7.2 via cdnjs CDN
- **Canvas effects**: `canvas_nest` enabled (blue lines, no mobile)
- **Post copyright**: CC BY-NC-SA 4.0
- **TOC**: Enabled for posts, disabled for pages

## Hexo Plugins

Both sites share the same core plugins. Key ones:

| Plugin | Purpose |
|---|---|
| `hexo-theme-butterfly` | Theme (v5.5.4 via npm) |
| `hexo-filter-optimize` | CSS/JS bundling (CN only, CSS bundle disabled) |
| `hexo-abbrlink` | Deterministic post URLs (`posts/:abbrlink/`) |
| `hexo-generator-searchdb` | Local search index |
| `hexo-renderer-nunjucks` | Template engine (Butterfly requires this) |
| `hexo-renderer-stylus` | CSS preprocessor |
| `hexo-deployer-git` | Git-based deployment |
| `hexo-baidu-url-submit` | Auto-submit URLs to Baidu |
| `hexo-wordcount` | Word count / reading time |
| `hexo-generator-feed` | Atom/RSS feed |
| `hexo-filter-nofollow` | Add `rel="nofollow"` to external links |

## Writing Posts

Posts go in `source/_posts/` as `.md` files. Front-matter format:

```yaml
---
title: Post Title
date: 2026-05-28 22:00:00
categories: [技术杂谈]
tags: [hexo, blog]
---
```

- **abbrlink**: Do NOT set manually. The `hexo-abbrlink` plugin auto-generates a numeric abbrlink at build time. The permalink format is `posts/:abbrlink/`.
- **Images**: Place in `source/img/` or `source/upload/`, reference with `/img/filename.png`.
- **Skip rendering**: Files matching `['*.html', demo/**, test/*, ip/**]` in `skip_render` config.

## Pitfalls

### 1. EN site root must be `/en/`, not `/`

Setting `root: /` in EN config makes HTML reference `/css/index.css` (domain root), but the file is at `CN/public/en/css/index.css` after merge. Result: 404 for all assets.

### 2. filter_optimize css.bundle is broken

The `hexo-filter-optimize` plugin's `css.bundle: true` replaces all `<link>` tags with async JS (`loadCss()`), causing:
- **FOUC** (flash of unstyled content) on every page load
- **Navigation bar disappearing** on refresh
- For EN site: `style.css` path mismatch → complete style loss

The `delivery: false` config option does NOT prevent this — it only controls external CDN resources. To fix, set `css.bundle: false`.

### 3. filter_optimize + root mismatch (EN)

When `filter_optimize` is enabled with a non-`/` root, it generates `style.css` at `public/en/style.css` while other content is at `public/`. This causes path inconsistency. Solution: disable `filter_optimize` entirely for the EN site.

### 4. Butterfly theme is installed via npm

The theme is `hexo-theme-butterfly` in `package.json`, NOT a git submodule in `themes/`. Old themes (landscape, next, yilia) exist in `themes/` but are unused. Do NOT try to configure them.

### 5. YAML indentation is sensitive

Butterfly config uses YAML. Indentation must be spaces (not tabs), and inconsistent indentation can silently break config parsing. Always verify with `hexo generate` after editing.

### 6. Font Awesome version

Butterfly defaults to FA 7.1.0 which doesn't exist on cdnjs. The config uses FA 6.7.2 loaded from `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css`. If upgrading Butterfly, verify the FA version.

## Common Tasks

### Add a new post (CN)

```bash
cd ~/blogs/blog.source
hexo new "Post Title"
# Edit source/_posts/post-title.md
hexo generate  # Verify build
hexo server    # Preview at localhost:4000
```

### Add a new post (EN)

```bash
cd ~/blogs/blog.source.en
hexo new "Post Title"
# Edit source/_posts/post-title.md
```

### Full build & preview

```bash
cd ~/blogs
./deploy.sh -c        # Clean build both sites, preview at localhost:4000
```

### Deploy to production

```bash
cd ~/blogs
./deploy.sh -d        # Build + git push → Vercel auto-deploys
```

### Edit theme config

- CN: `~/blogs/blog.source/_config.butterfly.yml`
- EN: `~/blogs/blog.source.en/_config.butterfly.yml`
- After editing: `hexo generate` to verify, check generated HTML in `public/`

### Edit site config

- CN: `~/blogs/blog.source/_config.yml`
- EN: `~/blogs/blog.source.en/_config.yml`

## Git

The entire `~/blogs/` directory is a single git repo. `node_modules/`, `public/`, and `db.json` are git-ignored. The `.deploy_git/` directories (used by `hexo-deployer-git`) are tracked.

## File References

| Path | Description |
|---|---|
| `deploy.sh` | Build & deploy script |
| `blog.source/_config.yml` | CN Hexo config |
| `blog.source/_config.butterfly.yml` | CN theme config |
| `blog.source.en/_config.yml` | EN Hexo config |
| `blog.source.en/_config.butterfly.yml` | EN theme config |
| `blog.source/source/_posts/` | CN posts (88 .md files) |
| `blog.source.en/source/_posts/` | EN posts (4 .md files) |
