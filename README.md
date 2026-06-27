# 博客项目

基于 Hexo 的中英文双语技术博客，部署在 Vercel 上。

- **地址**：https://lichuanyang.top/
- **英文站**：https://lichuanyang.top/en/
- **仓库**：`git@github.com:lcy362/lcy362.github.io.git`

## 快速开始

### 环境要求

- Node.js 18+
- npm

### 本地预览

```bash
cd ~/blogs
./deploy.sh          # 构建双站并启动本地预览
# 访问 http://localhost:4000
# 英文站访问 http://localhost:4000/en/
```

### 部署到生产

```bash
cd ~/blogs
./deploy.sh -d       # 构建 + 推送到 GitHub → Vercel 自动部署
```

---

## 新增文章流程

### 场景一：只新增中文文章

```bash
# 1. 创建文章
cd ~/blogs/blog.source
hexo new "文章标题"

# 2. 编辑文章
vim source/_posts/文章标题.md

# 3. 本地预览
hexo server

# 4. 构建验证
hexo generate
```

### 场景二：翻译已有中文文章为英文

假设中文文章为 `blog.source/source/_posts/我的文章.md`：

```bash
# 1. 先构建中文站，让插件生成 abbrlink
cd ~/blogs/blog.source
hexo generate

# 2. 获取中文文章的 abbrlink
grep "^abbrlink:" source/_posts/我的文章.md
# 输出示例：abbrlink: 12345

# 3. 创建英文文章
cd ~/blogs/blog.source.en
hexo new "My Article Title"

# 4. 编辑英文文章，并在 front-matter 中添加 abbrlink
vim source/_posts/my-article-title.md
```

英文文章的 front-matter 应包含：

```yaml
---
title: My Article Title
abbrlink: 12345          # ← 与中文文章相同的值
date: 2026-05-30 10:00:00
categories: [Tech]
tags: [tag1, tag2]
---
```

### 场景三：同时新增中英文文章

```bash
# 1. 创建并编辑中文文章
cd ~/blogs/blog.source
hexo new "新文章标题"
vim source/_posts/新文章标题.md

# 2. 构建生成 abbrlink
hexo generate
grep "^abbrlink:" source/_posts/新文章标题.md
# 记下 abbrlink 值，例如：67890

# 3. 创建并编辑英文文章（带相同的 abbrlink）
cd ~/blogs/blog.source.en
hexo new "New Article Title"
vim source/_posts/new-article-title.md
# 在 front-matter 中添加：abbrlink: 67890
```

---

## GEO 优化：为文章添加 FAQ

对搜索流量有期待的文章，建议在文末添加 FAQ section。这会自动生成 FAQPage JSON-LD 结构化数据，帮助 Google AI Overview 和 People Also Ask 抓取。

### 操作步骤

**1. 在文章末尾写 FAQ section**

```markdown
## 常见问题

### Q: 这个问题读者可能会问？
简短的回答，2-4 句话即可。

### Q: 另一个相关问题？
同样简短的回答。
```

**2. 在 front-matter 添加 `faq:` 字段**

```yaml
---
faq:
  - q: "这个问题读者可能会问？"
  - q: "另一个相关问题？"
---
```

只列问题——答案从正文 `### Q:` 段落自动提取，不需要重复写。

**3. 效果**

构建后自动生成：
- `<script type="application/ld+json">` FAQPage Schema（搜索引擎可见）
- 文章底部「相关问答」组件自动关联同分类下有 FAQ 的其他文章

### 英文版同步

英文版 FAQ section 需要翻译，但 front-matter 的 `faq:` 字段用英文问题文本。其他流程一致。

---
## TL;DR 摘要：让 AI 搜索引擎理解文章

建议为所有超过 3000 字的文章添加 TL;DR 摘要，告诉 AI 这篇文章的核心观点。

### 操作步骤

在 front-matter 中添加 `tldr:` 字段：

```yaml
---
title: 文章标题
tldr: "一句话总结这篇文章的核心观点"
---
```

只用一句话（30-60 字），陈述核心观点，不要写成营销文案。

### 效果

构建后自动生成：
- 文章顶部出现带主题色的 TL;DR 摘要块（读者可见）
- BlogPosting JSON-LD 中注入 `"abstract"` 字段（搜索引擎和 AI 可解析）

### 英文版同步

英文版文章的 `tldr:` 用英文写，内容与中文版对应。

---

## 新增文章标题图

每篇文章都需要一张标题图（cover image），中英文对应文章共用同一张图。

### 1. 生成图片

使用 Agnes AI 生成图片，API Key 存放在 `~/.hermes/.env` 的 `AGNES_API_KEY` 中：

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

### 2. 压缩图片

原始 PNG 通常 2MB+，必须压缩为 JPEG：

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

压缩后平均约 75KB/张。

### 3. 放置图片

将压缩后的 `{abbrlink}.jpg` 复制到中英文两个站的图片目录：

```bash
cp {abbrlink}.jpg ~/blogs/blog.source/source/img/
cp {abbrlink}.jpg ~/blogs/blog.source.en/source/img/
```

### 4. 配置文章 front-matter

在中英文文章的 YAML front-matter 中添加 `cover` 字段：

```yaml
---
title: 文章标题
date: 2026-06-08 10:00:00
categories: [技术杂谈]
tags: [hexo, blog]
abbrlink: 12345
cover: /img/12345.jpg    # ← 新增这行
---
```

**注意**：中英文文章都要添加相同的 `cover` 路径。

### 5. 命名规范

- 文件名：`{abbrlink}.jpg`（如 `12345.jpg`）
- 格式：JPEG，quality=82
- 最大宽度：1200px
- 引用路径：`/img/{abbrlink}.jpg`

---

## abbrlink 规则

abbrlink 是文章的永久标识符，用于生成稳定的 URL（如 `/posts/12345/`）。

### 核心原则

1. **不要手动生成**：`hexo-abbrlink` 插件会在 `hexo generate` 时自动生成
2. **中英文必须一致**：同一内容的中英文文章必须使用相同的 abbrlink
3. **一旦发布不要修改**：修改 abbrlink 会导致旧链接失效

### 如何同步 abbrlink

在英文文章的 front-matter 中手动添加 `abbrlink` 字段，值为对应中文文章的 abbrlink：

```yaml
# 英文文章 front-matter
---
title: English Title
abbrlink: 12345    # ← 从中文文章复制过来
---
```

### 验证一致性

```bash
# 检查某篇文章的 abbrlink
grep "^abbrlink:" blog.source/source/_posts/中文文章.md
grep "^abbrlink:" blog.source.en/source/_posts/english-article.md
# 两个值应该相同
```

### ⚠️ 更新 hreflang 映射

**新增或修改文章后，必须运行以下命令更新 hreflang 映射**：

```bash
cd ~/blogs
./scripts/update_hreflang_map.sh
```

此脚本会扫描所有中英文文章，更新 `hreflang_map.json`，确保搜索引擎能正确关联多语言版本。

**注意**：hreflang 映射只覆盖文章页和已有分类。如果新增了分类，需要手动更新 `scripts/hreflang.js` 中的 `CATEGORY_MAP`。

---

## 部署流程详解

```bash
./deploy.sh [选项]
```

| 选项 | 说明 |
|------|------|
| 无参数 | 构建双站 + 本地预览 |
| `-d` | 构建 + 推送到 GitHub（触发 Vercel 部署） |
| `-c` | 清理缓存后重新构建 |
| `-c -d` | 清理 + 构建 + 部署 |

### 部署原理

1. `blog.source/`（中文站）和 `blog.source.en/`（英文站）是两个独立的 Hexo 实例
2. 构建时，英文站输出到 `blog.source.en/public/`
3. 脚本将英文站的输出复制到 `blog.source/public/en/`（先清空旧目录）
4. 删除 `.deploy_git` 后重新从 GitHub 克隆（避免 macOS 大小写问题）
5. 最终只推送 `blog.source/public/` 到 GitHub
6. Vercel 检测到 GitHub 更新后自动部署

### 为什么不直接推送到 Vercel？

因为需要将两个独立的 Hexo 站点合并成一个统一的目录结构。GitHub 只是作为 Vercel 的部署触发源。

---

## 目录结构

```
~/blogs/
├── deploy.sh                  # 部署脚本
├── AGENTS.md                  # AI Agent 上下文（详细技术文档）
├── README.md                  # 本文件（人类可读）
│
├── blog.source/               # 中文站（主站）
│   ├── _config.yml            # Hexo 配置
│   ├── _config.butterfly.yml  # 主题配置
│   ├── source/_posts/         # 中文文章
│   └── source/img/            # 图片资源
│
└── blog.source.en/            # 英文站
    ├── _config.yml            # Hexo 配置（root: /en/）
    ├── _config.butterfly.yml  # 主题配置
    └── source/_posts/         # 英文文章
```

---

## 常见问题

### Q: 英文站样式丢失怎么办？

检查 `blog.source.en/_config.yml` 中的 `root` 是否为 `/en/`。绝对不能改成 `/`。

### Q: 构建报错 YAML 解析失败？

检查 `_config.butterfly.yml` 的缩进，必须用空格不能用 Tab。

### Q: 新文章没有 abbrlink？

确保运行了 `hexo generate`。abbrlink 只在构建时生成，不会在 `hexo new` 时生成。

### Q: 如何预览英文站？

本地预览时访问 `http://localhost:4000/en/`。英文站内容已合并到中文站的 `public/en/` 目录下。

### Q: 英文站分类/标签页面 404？

可能是 macOS 大小写不敏感导致的部署问题。解决方法：

```bash
# 1. 删除 .deploy_git 强制重新克隆
rm -rf ~/blogs/blog.source/.deploy_git

# 2. 重新部署
./deploy.sh -d
```

详细原因见 AGENTS.md 的「踩坑记录 #7」。

---

## 技术栈

- **框架**：Hexo 8.1.2
- **主题**：Butterfly 5.5.4
- **部署**：Vercel（通过 GitHub 触发）
- **域名**：lichuanyang.top
