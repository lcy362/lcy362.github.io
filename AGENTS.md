# AGENTS.md — 博客项目上下文

## 项目概述

这是一个基于 **Hexo** 的静态博客，采用中英文双语架构，部署在 **Cloudflare Pages** 上，访问地址：`https://lichuanyang.top/`。英文站点位于 `/en/` 路径下。

- **框架**：Hexo 8.1.2
- **主题**：Butterfly 5.5.4（通过 npm 安装，非 git submodule）
- **域名**：`lichuanyang.top`（Cloudflare Pages 托管，DNS 在 Cloudflare 管理）
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
./deploy.sh -d           # 构建 + 部署到 GitHub（触发 Cloudflare Pages 自动部署）
./deploy.sh -c -d        # 清理后构建 + 部署
./deploy.sh -c           # 清理后构建 + 本地预览
```

### 脚本执行流程（4 步）：

1. **构建中文站**：`cd blog.source && hexo generate`
2. **构建英文站**：`cd blog.source.en && hexo generate`
3. **合并**：先 `rm -rf blog.source/public/en`，再 `cp -r blog.source.en/public/. blog.source/public/en/`
4. **部署/预览**：`rm -rf .deploy_git && hexo deploy`（部署时）或 `hexo server`（预览时）

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

Cloudflare Pages 使用 `_headers` 文件配置 HTTP 响应头（替代 Vercel 的 `vercel.json`）。该文件位于 `blog.source/source/_headers`，构建时会被复制到 `public/_headers`。

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

### 5. 新增文章标题图（Cover Image）

每篇文章都需要一张标题图，中英文对应文章共用同一张。

#### 5.1 用 Agnes AI 生成图片

API Key 存放在 `~/.hermes/.env` 的 `AGNES_API_KEY` 中。使用 `agnes-image-2.1-flash` 模型（免费）：

```bash
export AGNES_API_KEY=$(grep AGNES_API_KEY ~/.hermes/.env | cut -d= -f2)

curl -X POST "https://apihub.agnes-ai.com/v1/images/generations" \
  -H "Authorization: Bearer $AGNES_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-image-2.1-flash",
    "prompt": "A minimalist blog header illustration about <文章主题>...",
    "size": "1792x1024"
  }'
```

从返回的 JSON 中获取图片 URL 并下载。

#### 5.2 压缩图片

原始 PNG 通常 2MB+，必须压缩为 JPEG（约 75KB/张）：

```python
from PIL import Image

im = Image.open("downloaded.png")
# 缩放到最大宽度 1200px
w, h = im.size
if w > 1200:
    im = im.resize((1200, int(h * 1200 / w)), Image.LANCZOS)
# 转换 RGBA 为 RGB（白色背景）
if im.mode != "RGB":
    bg = Image.new("RGB", im.size, (255, 255, 255))
    bg.paste(im, mask=im.split()[-1] if im.mode == "RGBA" else None)
    im = bg
im.save(f"{abbrlink}.jpg", "JPEG", quality=82, optimize=True)
```

#### 5.3 放置图片

将压缩后的 `{abbrlink}.jpg` 复制到中英文两个站的图片目录：

```bash
cp {abbrlink}.jpg ~/blogs/blog.source/source/img/
cp {abbrlink}.jpg ~/blogs/blog.source.en/source/img/
```

#### 5.4 配置文章 front-matter

在中英文文章的 YAML front-matter 中添加 `cover` 字段：

```yaml
cover: /img/{abbrlink}.jpg
```

#### 5.5 命名规范

- 文件名：`{abbrlink}.jpg`（如 `12345.jpg`）
- 格式：JPEG，quality=82
- 最大宽度：1200px
- 引用路径：`/img/{abbrlink}.jpg`

### 6. 验证 abbrlink 一致性

```bash
cd ~/blogs
# 运行检查脚本（如果存在）
# 或手动比对中英文文章的 abbrlink
```

## 人机协作创作工作流

当人提供初步思路、AI 辅助完成一篇博客文章时的标准流程。核心原则：**人做决策和核心内容，AI 做辅助和填充**。

### 第一阶段：思路 → 标题 + 建文章

1. **人**：用自然语言描述文章主题、核心观点、大致结构
2. **AI**：根据描述生成 2–3 个备选标题，供人选择确认
3. **人**：选定标题（或要求调整）
4. **AI**：执行 `hexo new` 创建文章，设置 front-matter 基础字段（`title`、`date`、`categories`），**不写正文**
5. 可选：AI 同时在英文站创建对应的空白文章（方便后续翻译）

**AI 不在此阶段写正文**。人拿到的是一个只有 front-matter 和空正文的文章文件。

### 第二阶段：人写内容 + 预留「AI填充」段落

1. **人**：在文章中编写核心内容
2. 在需要 AI 帮助的部分，使用以下标记预留段落：

```markdown
<!-- AI填充 -->
（AI 根据上下文自动生成此段落的内容）
<!-- /AI填充 -->
```

或者带指令的形式：

```markdown
<!-- AI填充: 用 200 字左右解释 React reconciliation 的工作原理 -->
<!-- /AI填充 -->
```

**AI填充段落可以出现在文章的任何位置**：
- 需要扩展的技术解释
- 需要补充的背景知识
- 需要生成的代码示例
- 需要翻译的段落
- 需要总结的过渡段

3. **人**完成所有自己能写的部分后，将文章文件交给 AI 进入第三阶段

### 第三阶段：AI 填充 + 格式规整 + 生成 tags + 部署

AI 按以下顺序完成：

#### 3.1 填充「AI填充」段落

- **逐个处理**每个 `<!-- AI填充 -->` 标记
- 根据段落前后的上下文、文章主题、带指令的要求来生成内容
- **生成后删除标记本身**（`<!-- AI填充 -->` 和 `<!-- /AI填充 -->`），只保留生成的内容
- 如果有带指令的填充（如"200 字左右"），严格遵循约束

#### 3.2 格式规整

- 检查 Markdown 格式：标题层级、代码块语言标注、链接格式等
- 确保段落间有合适的空行，代码块有正确的语言标识
- 检查 front-matter 格式是否正确

#### 3.3 生成 tags

- 根据文章内容自动生成 3–8 个 tags
- Tag 规范：
  - **英文站**：tag 使用连字符形式（如 `design-patterns`，不用 `design patterns`）
  - **中文站**：tag 使用中文或英文均可，多个词用空格分隔
- 更新文章 front-matter 的 `tags` 字段

#### 3.4 生成标题图

- 如果有 Agnes AI 可用，根据文章主题生成标题图（参考「5. 新增文章标题图」流程）
- 如果没有，可以跳过

#### 3.5 构建验证 + 部署

```bash
cd ~/blogs/blog.source
hexo generate    # 构建验证，确保无报错
```

验证通过后：

```bash
cd ~/blogs
./deploy.sh -d   # 部署到生产环境
```

### 第四阶段（可选）：英文翻译

1. 构建中文站获取 abbrlink
2. 在英文站创建对应文章，同步 abbrlink
3. 人编写英文核心内容，预留「AI填充」段落
4. AI 填充英文站的预留段落并完成格式规整

### 工作流汇总

```
人: 提供思路
  ↓
AI: 生成标题 + hexo new（不写正文）
  ↓
人: 选定标题，编写核心内容，预留「AI填充」段落
  ↓
AI: 填充段落 → 规整格式 → 生成tags → 生成标题图 → 构建验证 → 部署
  ↓ (可选)
人+AI: 英文翻译（重复上述流程）
```

## 部署到生产环境

```bash
cd ~/blogs
./deploy.sh -d        # 构建 + git push → Cloudflare Pages 自动部署
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

### 1. hreflang 动态生成（2026-05-30，更新 2026-05-31）

**目的**：为中英文文章和分类页面生成正确的 hreflang 标签，帮助搜索引擎识别多语言版本对应关系。

**新增文件**：
- `blog.source/scripts/hreflang.js` — Hexo 脚本，在 HTML 渲染后动态注入 hreflang 标签
- `blog.source/source/_data/hreflang_map.json` — 中英文文章 abbrlink 映射（84 对）
- `blog.source.en/source/_data/hreflang_map.json` — 同上（副本）

**修改文件**：
- `blog.source/_config.butterfly.yml` — 移除 `inject.head` 中的静态 hreflang 注入
- `blog.source.en/_config.butterfly.yml` — 同上

**工作原理**：
1. `hreflang.js` 使用 Hexo 的 `after_render:html` filter，在 HTML 生成后注入 hreflang
2. 根据页面类型生成对应的 hreflang 标签：
   - **首页**：指向中英文首页
   - **文章页**：通过 abbrlink 关联中英文版本
   - **分类页**：通过内置映射表关联中英文分类（14 个分类）
3. 分类页检测方式：`data.category` 存在或 `page.path` 以 `categories/` 开头

**分类映射表**（硬编码在 `hreflang.js` 中）：

| 中文分类 | 英文 slug |
|----------|-----------|
| 技术杂谈 | tech-talk |
| Java | java |
| 消息队列 | message-queue |
| activemq系列文章 | activemq-series |
| 数据库 | database |
| 大数据 | big-data |
| AI实践 | ai-practice |
| jstorm源码解析 | jstorm-source-code-analysis |
| 云原生 | cloud-native |
| 算法 | algorithm |
| redis系列 | redis-series |
| 分布式系统模式系列 | distributed-systems-patterns-series |
| 读书笔记 | book-notes |
| 架构设计 | architecture-design |

**⚠️ 新增分类时必须更新映射表**：在两个站点的 `scripts/hreflang.js` 中的 `CATEGORY_MAP` 添加新条目。

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
# 文章页
grep "hreflang" public/posts/64/index.html
# 分类页
grep "hreflang" public/categories/技术杂谈/index.html
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
- **Tag 也必须使用连字符形式**（如 `design-patterns`，不要写 `design patterns`）

**Tag 标准化示例**：

| 错误写法 | 正确写法 |
|----------|----------|
| `design patterns` | `design-patterns` |
| `distributed systems` | `distributed-systems` |
| `open source project` | `open-source-project` |

### 3. 自定义 sitemap 模板（2026-05-30，更新 2026-05-31）

**目的**：两个站点都使用自定义 sitemap 模板，包含文章、标签和分类页面。

**文件位置**：
- `blog.source/sitemap_template.xml`
- `blog.source.en/sitemap_template.xml`（内容略有不同）

**关键差异**：
- **英文站**的分类和标签 URL 使用 `| lower` 过滤器强制小写化，避免 404
- **中文站**不使用 `| lower`（中文分类名不受大小写影响）

**⚠️ 升级注意事项**：
- 如果需要修改 sitemap 格式，两个站点都要同步修改
- 英文站的 `| lower` 过滤器依赖 Nunjucks 内置的 `lower` filter

**验证方法**：
```bash
cd ~/blogs/blog.source
hexo generate
head -3 public/sitemap.xml  # 检查命名空间是否为 https
grep -c '<url>' public/sitemap.xml  # 应包含文章+标签+分类

cd ~/blogs/blog.source.en
hexo generate
# 检查分类 URL 是否小写
grep 'categories' public/sitemap.xml | head -5
```

### 4. 结构化数据增强（2026-05-30）

**目的**：为文章页添加 BreadcrumbList 结构化数据和 author.sameAs 社交链接。

**新增文件**：
- `blog.source/scripts/structured-data.js` — 增强文章页的 JSON-LD 结构化数据
- `blog.source.en/scripts/structured-data.js` — 同上（英文站）

**功能**：
1. 为每篇文章添加 BreadcrumbList schema（首页 → 分类 → 文章）
2. 为 BlogPosting schema 的 author 添加 sameAs 属性（GitHub、StackOverflow、知乎）

**验证方法**：
```bash
cd ~/blogs/blog.source
hexo generate
grep 'BreadcrumbList' public/posts/64/index.html  # 应看到面包屑数据
grep 'sameAs' public/posts/64/index.html  # 应看到社交链接
```

### 5. 英文站分类和标签 URL 小写化（2026-05-30，更新 2026-05-31）

**目的**：解决英文站分类和标签页面 404 问题（macOS 大小写不敏感导致的部署不一致）。

**问题根因**：
- macOS 文件系统大小写不敏感，git 无法正确追踪仅大小写不同的目录重命名

**新增文件**：
- Hexo 配置 `filename_case: 0` 保留原始大小写，导致标签如 `AI Agent` 生成为 `ai-Agent`
- 在大小写敏感的 Cloudflare Pages/Linux 环境中，混合大小写 URL 返回 404

**新增文件**：
- `blog.source.en/scripts/category-slug-fix.js` — 自定义分类/标签生成器 + HTML 链接修复

**功能**：
1. 覆盖默认分类生成器，强制所有分类 URL 使用小写（如 `/categories/tech-talk/`）
2. 覆盖默认标签生成器，强制所有标签 URL 使用小写（如 `/tags/ai-agent/`）
3. 修复 HTML 页面中的分类/标签链接指向小写 URL
4. 英文站 sitemap 模板使用 `| lower` 过滤器确保 sitemap URL 小写

**⚠️ 新增文章注意事项**：
- 英文文章的分类名称仍使用 PascalCase（如 `Java`、`Tech Talk`），显示名称不变
- Tag 使用连字符形式（如 `design-patterns`），不要用空格
- URL 会自动转为小写（如 `/categories/java/`、`/tags/ai-agent/`）

**验证方法**：
```bash
cd ~/blogs/blog.source.en
hexo generate
ls public/categories/  # 应全部小写
ls public/tags/        # 应全部小写
grep 'categories' public/sitemap.xml | head -5  # 应全部小写
```

| 项目 | 实现方式 | 风险 |
|------|----------|------|
| Butterfly 主题 | 通过 npm 安装（`hexo-theme-butterfly`），非 git submodule | 低 — npm 升级即可 |
| 英文站合并 | `deploy.sh` 先清空 `public/en/` 再复制 | 低 — 脚本稳定 |
| hreflang 映射 | 手动维护 `hreflang_map.json` + 硬编码分类映射 | 中 — 新增文章/分类需手动更新 |
| 分类/标签 URL 小写化 | `category-slug-fix.js` 覆盖生成器 | 低 — 仅英文站 |
| `.deploy_git` 管理 | 每次部署前删除重新克隆 | 低 — 避免大小写问题 |

### 6. GEO 优化：FAQ/HowTo 结构化数据（2026-06-27）

**目的**：为文章生成 FAQPage 和 HowTo JSON-LD 结构化数据，提升 Google AI Overview 和 People Also Ask 中的展示机会。

**新增文件**：
- `blog.source/scripts/geo-schema.js` — FAQ/HowTo JSON-LD 动态生成
- `blog.source/scripts/related-faq.js` — 文章底部「相关问答」组件
- `blog.source.en/scripts/geo-schema.js` — 同上（英文站）
- `blog.source.en/scripts/related-faq.js` — 同上（英文站）

**工作原理**：
1. 文章 front-matter 中声明 `faq:` 字段（问题列表）
2. 正文中以 `### Q: 问题` 格式编写 FAQ section
3. `geo-schema.js` 在构建时读取 front-matter，从渲染后 HTML 自动提取答案
4. 生成 `<script type="application/ld+json">` FAQPage Schema 注入 `<head>`
5. `related-faq.js` 按同分类 + 标签交集匹配其他有 FAQ 的文章，注入文章底部推荐

**Front-matter 示例**：
```yaml
---
faq:
  - q: "问题文本？"
  - q: "另一个问题？"
---
```

**正文 FAQ section 示例**：
```markdown
## 常见问题

### Q: 问题文本？
简短回答，2-4 句话。

### Q: 另一个问题？
同样简短的回答。
```

**⚠️ 新增文章注意事项**：
- 只需在 front-matter 列问题清单，答案自动从正文 `### Q:` 段落提取
- front-matter 中的问题文本和正文中的 `### Q:` 标题要完全一致（答案提取依赖文本匹配）
- 英文版 FAQ 需要翻译：正文 FAQ section + front-matter `faq:` 字段都用英文
- 如果文章没有对应的英文版，英文站脚本不会生成 FAQ Schema（因为没有对应文章）

**验证方法**：
```bash
cd ~/blogs/blog.source
hexo generate
grep 'FAQPage' public/posts/<abbrlink>/index.html  # 应看到 FAQPage JSON-LD
grep 'relatedFaq' public/posts/<abbrlink>/index.html  # 应看到相关问答组件
```

**FAQ 与 hreflang 的关系**：
- FAQ 文章的中英文版通过 abbrlink 关联
- 新增 FAQ 文章后，需要运行 `./scripts/update_hreflang_map.sh` 更新映射
- related-faq 组件只在同语言内推荐（中文文章推荐中文 FAQ，英文推荐英文 FAQ）

### 7. TL;DR 摘要模式（2026-06-27）

**目的**：为文章注入结构化摘要，提升 AI 搜索引擎（Google SGE、Perplexity 等）对文章核心观点的理解和引用。

这解决了两个问题：
1. **视觉层**：读者打开文章后一眼看到核心观点，决定要不要精读
2. **数据层**：BlogPosting JSON-LD 中注入 `abstract` 字段，AI 可直接解析

**工作原理**：
1. 文章 front-matter 中声明 `tldr:` 字段（一句话摘要）
2. `geo-schema.js` 在构建时：
   - 将 TL;DR 渲染为文章顶部的主题色引用块（`<blockquote class="tldr-block">`）
   - 注入到 BlogPosting JSON-LD 的 `abstract` 字段（位于 `image` 和 `datePublished` 之间）
3. 无 `tldr:` 字段的文章不受影响，不会生成 `abstract`

**Front-matter 示例**：
```yaml
---
title: 文章标题
tldr: "一句话总结这篇文章的核心观点"
---
```

**HTML 输出**（视觉层）：
```html
<blockquote class="tldr-block">
  <strong>TL;DR</strong> 一句话总结这篇文章的核心观点
</blockquote>
```

**JSON-LD 输出**（数据层）：
```json
{
  "@type": "BlogPosting",
  "abstract": "一句话总结这篇文章的核心观点",
  "datePublished": "2026-06-16T05:20:05.000Z",
  ...
}
```

**目前覆盖**：中文站 29/93 篇（31%），英文站 24/89 篇（27%）。

**⚠️ 注意事项**：
- TL;DR 只用一句话（30-60 字），陈述核心观点，不要写成营销文案
- 英文版文章的 `tldr:` 用英文写，内容与中文版对应
- 短文章（<1500 字）可以不加，超过 3000 字的建议都加

**验证方法**：
```bash
cd ~/blogs/blog.source
hexo generate
grep '"abstract"' public/posts/<abbrlink>/index.html  # 应看到 abstract 字段
grep 'tldr-block' public/posts/<abbrlink>/index.html  # 应看到 TL;DR 块
```

**与 meta description 的区别**：
- `description`：150-160 字符，面向 SERP 点击，可带营销性
- `abstract`（TL;DR）：30-60 字符，面向 AI 理解，纯陈述核心观点

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

### 7. `.deploy_git` 大小写不敏感导致部署问题

**现象**：英文站构建产物中目录名是小写（如 `tags/ai-agent/`），但 GitHub 仓库中仍是大写（如 `tags/AI-Agent/`），导致线上 404。

**根因**：
- `hexo deploy` 从 GitHub 克隆 `.deploy_git`，不会清空重建
- macOS 文件系统大小写不敏感，写入 `ai-agent/index.html` 会被写入已存在的 `AI-Agent/index.html`
- Git 不追踪大小写变化（`core.ignorecase` 默认为 `true`）

**解决方案**：`deploy.sh` 中在 `hexo deploy` 前删除 `.deploy_git`，强制重新克隆：
```bash
rm -rf .deploy_git
hexo deploy
```

**⚠️ 如果遇到分类/标签页面 404，先检查此问题**：
```bash
# 检查 GitHub 仓库中的目录名
curl -s "https://api.github.com/repos/lcy362/lcy362.github.io/contents/en/tags" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for item in data:
    if item['name'] != item['name'].lower():
        print(f'大写目录: {item[\"name\"]}')
"
```

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
| `blog.source/scripts/hreflang.js` | hreflang 标签注入脚本（含分类映射表） |
| `blog.source/scripts/structured-data.js` | 结构化数据增强（BreadcrumbList + author.sameAs） |
| `blog.source/scripts/geo-schema.js` | GEO schema 生成（FAQ/HowTo JSON-LD + TL;DR abstract） |
| `blog.source/scripts/related-faq.js` | 文章底部「相关问答/教程」组件 |
| `blog.source.en/scripts/category-slug-fix.js` | 英文站分类/标签 URL 小写化 |
| `blog.source.en/scripts/geo-schema.js` | 英文站 GEO schema 生成 |
| `blog.source.en/scripts/related-faq.js` | 英文站相关问答组件 |
| `blog.source/source/_headers` | Cloudflare Pages HTTP 响应头配置 |
| `blog.source.en/sitemap_template.xml` | 英文站 sitemap 模板（含 `| lower`） |
