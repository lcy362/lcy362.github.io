# AGENTS.md — 博客项目上下文

## 项目概述

这是一个基于 **Hexo** 的静态博客，采用中英文双语架构，部署在 **Vercel** 上，访问地址：`https://lichuanyang.top/`。英文站点位于 `/en/` 路径下。

- **框架**：Hexo 8.1.2
- **主题**：Butterfly 5.5.4（通过 npm 安装，非 git submodule）
- **域名**：`lichuanyang.top`（Vercel 托管，CNAME 配置在 source 中）
- **仓库**：`git@github.com:lcy362/lcy362.github.io.git`（master 分支）

## 项目结构

```
~/blogs/
├── deploy.sh                  # 统一构建部署脚本
├── AGENTS.md                  # AI Agent 上下文文档
├── README.md                  # 人类可读的使用说明
├── blog.source/               # 中文站点（主站）
│   ├── _config.yml            # Hexo 配置
│   ├── _config.butterfly.yml  # 主题配置（1100+ 行）
│   ├── package.json           # 依赖
│   ├── source/_posts/         # Markdown 文章（88 篇）
│   ├── source/{img,upload}/   # 静态资源
│   ├── themes/                # 旧主题（landscape, next, yilia）— 已弃用
│   ├── public/                # 构建输出（git 忽略）
│   └── node_modules/          # 依赖（git 忽略）
│
└── blog.source.en/            # 英文站点（独立 Hexo 实例）
    ├── _config.yml            # Hexo 配置（url/root/language 不同）
    ├── _config.butterfly.yml  # 主题配置（菜单链接不同）
    ├── package.json           # 相同依赖 + hexo-generator-i18n
    ├── source/_posts/         # 英文文章（84 篇）
    └── ...                    # 结构同中文站点
```

## 关键配置差异（中文 vs 英文）

| 配置项 | 中文（`blog.source`） | 英文（`blog.source.en`） |
|---|---|---|
| `url` | `https://lichuanyang.top/` | `https://lichuanyang.top/en` |
| `root` | `/` | `/en/` |
| `language` | `zh-CN` | `en` |
| `filter_optimize.enable` | `true` | `false` |
| `filter_optimize.css.bundle` | `false` | `true`（无关紧要，插件已禁用） |
| 额外插件 | — | `hexo-generator-i18n` |
| 菜单「English」/「中文」 | `English: /en` | `中文: https://lichuanyang.top/` |

## 部署脚本（`deploy.sh`）

位于 `~/blogs/deploy.sh`，用法：

```bash
./deploy.sh              # 构建双站 + 本地预览（hexo server）
./deploy.sh -d           # 构建 + 部署到 GitHub（触发 Vercel 自动部署）
./deploy.sh -c -d        # 清理后构建 + 部署
./deploy.sh -c           # 清理后构建 + 本地预览
```

### 脚本执行流程（4 步）：

1. **构建中文站**：`cd blog.source && hexo generate`
2. **构建英文站**：`cd blog.source.en && hexo generate`
3. **合并**：`cp -r blog.source.en/public/. blog.source/public/en/`
4. **部署/预览**：`hexo deploy`（git push 到 master）或 `hexo server`

### 关键：合并步骤

英文站的 `public/` 内容会被复制到中文站的 `public/en/` 目录下。之所以可行：
- 英文站的 `root: /en/` 使 HTML 引用 `/en/css/index.css`、`/en/js/main.js` 等路径
- 英文站构建时将文件输出到 `public/css/index.css`、`public/js/main.js`（相对于 root）
- 复制到 `CN/public/en/` 后，路径对齐：`CN/public/en/css/index.css` 对应 `/en/css/index.css`

**⚠️ 绝对不要将英文站的 `root` 改为 `/`** — 这会导致 CSS/JS 路径全部 404。详见「踩坑记录」。

## 主题配置（`_config.butterfly.yml`）

Butterfly 主题配置文件约 1100 行，关键设置：

- **菜单**：`menu:` 部分定义，格式：`标签: /路径 || 图标类名`
- **暗黑模式**：启用并显示切换按钮（`darkmode.enable: true`）
- **预加载**：Pace 进度条（`preloader.source: 2`）
- **搜索**：本地搜索（`search.use: local_search`）
- **评论**：Valine（LeanCloud）
- **统计**：百度统计 + Google Analytics
- **广告**：Google AdSense 已启用
- **Font Awesome**：6.7.2，通过 cdnjs CDN 加载
- **Canvas 特效**：`canvas_nest` 启用（蓝色线条，移动端禁用）
- **文章版权**：CC BY-NC-SA 4.0
- **目录（TOC）**：文章页启用，页面禁用

## Hexo 插件

两个站点共享核心插件：

| 插件 | 用途 |
|---|---|
| `hexo-theme-butterfly` | 主题（v5.5.4，通过 npm 安装） |
| `hexo-filter-optimize` | CSS/JS 打包（仅中文站，CSS bundle 已禁用） |
| `hexo-abbrlink` | 生成确定性文章 URL（`posts/:abbrlink/`） |
| `hexo-generator-searchdb` | 本地搜索索引 |
| `hexo-renderer-nunjucks` | 模板引擎（Butterfly 必需） |
| `hexo-renderer-stylus` | CSS 预处理器 |
| `hexo-deployer-git` | 基于 Git 的部署 |
| `hexo-baidu-url-submit` | 自动向百度提交 URL |
| `hexo-wordcount` | 字数统计 / 阅读时间 |
| `hexo-generator-feed` | Atom/RSS 订阅源 |
| `hexo-filter-nofollow` | 为外部链接添加 `rel="nofollow"` |

## 文章写作

文章以 `.md` 文件形式存放在 `source/_posts/` 目录下。Front-matter 格式：

```yaml
---
title: 文章标题
date: 2026-05-28 22:00:00
categories: [技术杂谈]
tags: [hexo, blog]
---
```

### abbrlink 规则（重要！）

- **不要手动生成 abbrlink**。`hexo-abbrlink` 插件会在构建时自动生成数字格式的 abbrlink
- 永久链接格式：`posts/:abbrlink/`
- **中英文对应文章必须使用相同的 abbrlink**，以确保语言切换时 URL 正确对应
- 如需手动同步 abbrlink（如翻译已有文章），在英文文章的 front-matter 中添加 `abbrlink: <中文文章的abbrlink值>`
- 定期运行检查脚本验证一致性

### 图片资源

- 存放在 `source/img/` 或 `source/upload/`
- 引用方式：`/img/filename.png`

### 跳过渲染

`skip_render` 配置中匹配的文件不会被渲染：`['*.html', demo/**, test/*, ip/**]`

## 新增中英文文章流程

### 1. 新增中文文章

```bash
cd ~/blogs/blog.source
hexo new "文章标题"
# 编辑 source/_posts/文章标题.md
hexo generate  # 构建验证
hexo server    # 本地预览 localhost:4000
```

### 2. 新增英文文章（翻译已有中文文章）

```bash
cd ~/blogs/blog.source.en
hexo new "English Title"
# 编辑 source/_posts/english-title.md
```

**关键步骤**：获取中文文章的 abbrlink 并同步到英文文章：

```bash
# 1. 先构建中文站，生成 abbrlink
cd ~/blogs/blog.source && hexo generate

# 2. 获取中文文章的 abbrlink
grep -r "^abbrlink:" source/_posts/中文文章.md

# 3. 在英文文章的 front-matter 中添加相同的 abbrlink
# 文件：blog.source.en/source/_posts/english-title.md
# 添加：abbrlink: <上面获取的值>
```

### 3. 同时新增中英文文章

```bash
# 1. 创建中文文章
cd ~/blogs/blog.source
hexo new "文章标题"
# 编辑内容

# 2. 构建以生成 abbrlink
hexo generate

# 3. 获取 abbrlink
grep -r "^abbrlink:" source/_posts/文章标题.md

# 4. 创建英文文章
cd ~/blogs/blog.source.en
hexo new "English Title"
# 编辑内容，并在 front-matter 中添加 abbrlink: <上面的值>
```

### 4. 验证 abbrlink 一致性

```bash
cd ~/blogs
# 运行检查脚本（如果存在）
# 或手动比对中英文文章的 abbrlink
```

## 部署到生产环境

```bash
cd ~/blogs
./deploy.sh -d        # 构建 + git push → Vercel 自动部署
```

## 编辑主题配置

- 中文站：`~/blogs/blog.source/_config.butterfly.yml`
- 英文站：`~/blogs/blog.source.en/_config.butterfly.yml`
- 编辑后：运行 `hexo generate` 验证，检查 `public/` 中生成的 HTML

## 编辑站点配置

- 中文站：`~/blogs/blog.source/_config.yml`
- 英文站：`~/blogs/blog.source.en/_config.yml`

## Git

整个 `~/blogs/` 目录是一个 git 仓库。`node_modules/`、`public/` 和 `db.json` 被 git 忽略。`.deploy_git/` 目录（`hexo-deployer-git` 使用）被跟踪。

## 自定义修改与扩展

本节记录所有对默认 Hexo/Butterfly 行为的自定义修改，升级主题或框架时需要特别注意。

### 1. hreflang 动态生成（2026-05-30）

**目的**：为中英文文章生成正确的 hreflang 标签，帮助搜索引擎识别多语言版本对应关系。

**新增文件**：
- `blog.source/scripts/hreflang.js` — Hexo 脚本，在 HTML 渲染后动态注入 hreflang 标签
- `blog.source/source/_data/hreflang_map.json` — 中英文文章 abbrlink 映射（84 对）
- `blog.source.en/source/_data/hreflang_map.json` — 同上（副本）

**修改文件**：
- `blog.source/_config.butterfly.yml` — 移除 `inject.head` 中的静态 hreflang 注入
- `blog.source.en/_config.butterfly.yml` — 同上

**工作原理**：
1. `hreflang.js` 使用 Hexo 的 `after_render:html` filter，在 HTML 生成后注入 hreflang
2. 根据页面类型（首页/文章页）生成对应的 hreflang 标签
3. 文章页通过 abbrlink 关联中英文版本

**⚠️ 升级注意事项**：
- 如果 Butterfly 主题升级后添加了自己的 hreflang 支持，可能会冲突
- 如果 Hexo 升级后 filter API 变化，`scripts/hreflang.js` 可能需要适配
- **新增文章后必须运行更新脚本**：
  ```bash
  cd ~/blogs
  ./scripts/update_hreflang_map.sh
  ```

**验证方法**：
```bash
cd ~/blogs/blog.source
hexo generate
grep "hreflang" public/posts/64/index.html
# 应该看到指向 /posts/64/ 和 /en/posts/64/ 的 hreflang
```

### 2. 英文站分类名称标准化（2026-05-30）

**目的**：统一英文站文章的分类名称，消除大小写混乱导致的重复分类。

**修改范围**：`blog.source.en/source/_posts/` 下 53 篇文章的 `categories` 字段

**标准化映射**：

| 原分类 | 标准化后 |
|--------|----------|
| `java`, `Java` | `Java` |
| `tech talk`, `tech-talks`, `Tech Talk` | `Tech Talk` |
| `big data`, `Big Data` | `Big Data` |
| `message queue`, `Message Queue` | `Message Queue` |
| `architecture design`, `architecture-design` | `Architecture Design` |
| `tech miscellany`, `Technical Miscellany` | `Tech Miscellany` |
| `cloud native` | `Cloud Native` |
| `database`, `databases` | `Database` |
| `activemq series` | `ActiveMQ Series` |
| `redis series` | `Redis Series` |
| `book notes` | `Book Notes` |
| `jstorm source code analysis` | `JStorm Source Code Analysis` |
| `distributed systems patterns series` | `Distributed Systems Patterns Series` |
| `algorithm` | `Algorithm` |

**⚠️ 新增文章注意事项**：
- 英文文章的分类必须使用上表中的标准形式
- 不要使用小写或连字符形式（如 `tech-talk`、`java`）

### 3. 已知的非标准实现

| 项目 | 实现方式 | 风险 |
|------|----------|------|
| Butterfly 主题 | 通过 npm 安装（`hexo-theme-butterfly`），非 git submodule | 低 — npm 升级即可 |
| 英文站合并 | `deploy.sh` 将英文站 `public/` 复制到中文站 `public/en/` | 低 — 脚本稳定 |
| hreflang 映射 | 手动维护 `hreflang_map.json` | 中 — 新增文章需手动更新 |

## 踩坑记录

### 1. 英文站 root 必须是 `/en/`，不能是 `/`

在英文站配置中设置 `root: /` 会使 HTML 引用 `/css/index.css`（域名根路径），但文件在合并后位于 `CN/public/en/css/index.css`。结果：所有静态资源 404。

### 2. filter_optimize 的 css.bundle 有问题

`hexo-filter-optimize` 插件的 `css.bundle: true` 会将所有 `<link>` 标签替换为异步 JS（`loadCss()`），导致：
- 每次加载页面都会出现 **FOUC**（无样式内容闪烁）
- 刷新时**导航栏消失**
- 英文站：`style.css` 路径不匹配 → 完全丢失样式

`delivery: false` 配置项无法阻止此行为 — 它只控制外部 CDN 资源。解决方法：设置 `css.bundle: false`。

### 3. filter_optimize + root 不匹配（英文站）

当 `filter_optimize` 启用且 root 不是 `/` 时，它会在 `public/en/style.css` 生成样式文件，而其他内容在 `public/`。这导致路径不一致。解决方案：英文站完全禁用 `filter_optimize`。

### 4. Butterfly 主题通过 npm 安装

主题是 `package.json` 中的 `hexo-theme-butterfly`，不是 `themes/` 目录下的 git submodule。旧主题（landscape, next, yilia）存在于 `themes/` 但已弃用。不要尝试配置它们。

### 5. YAML 缩进敏感

Butterfly 配置使用 YAML 格式。缩进必须使用空格（不能用 Tab），不一致的缩进会导致配置解析静默失败。编辑后务必用 `hexo generate` 验证。

### 6. Font Awesome 版本

Butterfly 默认使用 FA 7.1.0，但该版本在 cdnjs 上不存在。配置中使用 FA 6.7.2，从 `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css` 加载。升级 Butterfly 时需验证 FA 版本。

## 文件参考

| 路径 | 说明 |
|---|---|
| `deploy.sh` | 构建部署脚本 |
| `AGENTS.md` | AI Agent 上下文文档（本文件） |
| `README.md` | 人类可读的使用说明 |
| `blog.source/_config.yml` | 中文站 Hexo 配置 |
| `blog.source/_config.butterfly.yml` | 中文站主题配置 |
| `blog.source.en/_config.yml` | 英文站 Hexo 配置 |
| `blog.source.en/_config.butterfly.yml` | 英文站主题配置 |
| `blog.source/source/_posts/` | 中文文章（88 篇） |
| `blog.source.en/source/_posts/` | 英文文章（84 篇） |
