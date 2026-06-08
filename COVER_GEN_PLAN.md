# 博客标题图批量生成与配置计划

## 进度状态

| 阶段 | 状态 | 说明 |
|------|------|------|
| Task 1: 配置已有 16 张图片 | ✅ 完成 (2026-06-08) | 中英文文章均已配置 cover，已部署 |
| Task 2: 编写批量生成脚本 | ✅ 完成 (2026-06-08) | `scripts/batch_generate_covers.py` 已就绪 |
| Task 2 附加: 补配置 10 篇遗漏 | ✅ 完成 (2026-06-08) | 修复 batch_results.json 缺 abbrlink，补配 cover |
| Task 3-Batch1: 生成图片 #16-29 | ✅ 完成 (2026-06-08) | 14/14 篇，1 篇无英文对应 |
| Task 3-Batch2: 生成图片 #30-43 | ⬜ 待开始 | |
| Task 3-Batch3: 生成图片 #44-57 | ⬜ 待开始 | |
| Task 3-Batch4: 生成图片 #58-71 | ⬜ 待开始 | |
| Task 3-Batch5: 生成图片 #72-84 | ⬜ 待开始 | |
| Task 4: 最终验证 | ⬜ 待开始 | |

**已完成**: 83/90 中文 (92.2%) | 79/86 英文 (91.9%)
**剩余**: 7 篇中文 + 7 篇英文需要生成图片

## 批量生成脚本用法

```bash
# 生成下一批（默认 14 篇）
python3 scripts/batch_generate_covers.py

# 指定批次大小
python3 scripts/batch_generate_covers.py --batch 10

# 预览待处理（不生成）
python3 scripts/batch_generate_covers.py --dry-run
```

## Context

博客有 90 篇中文文章和 86 篇英文文章，其中 85 篇中文文章需要配置标题图（cover image）。已有 16 张图片生成完毕但未配置到文章中，还有 69 篇需要生成新图片。中英文对应文章使用同一张图，通过 abbrlink 关联。

**状态跟踪文件**：`batch_results.json`（记录每篇文章的图片生成和配置状态，支持断点续传）

## 关键文件

| 文件 | 用途 |
|------|------|
| `prompts_batch.json` | 85 篇文章的图片生成 prompt（含 filename、title、abbrlink、prompt） |
| `batch_results.json` | 已生成图片的结果记录（abbrlink → 图片路径） |
| `COVER_GEN_PLAN.md` | 本计划文档 |
| `blog.source/source/_posts/*.md` | 中文文章 Markdown 文件 |
| `blog.source.en/source/_posts/*.md` | 英文文章 Markdown 文件 |
| `blog.source/source/img/` | 中文站图片存放目录 |
| `blog.source.en/source/img/` | 英文站图片存放目录（需同步复制） |
| `blog.source/source/_data/hreflang_map.json` | 中英文文章 abbrlink 映射（abbrlink → {cn, en}） |
| `/Users/lcy/.hermes/skills/creative/agnes-image-gen/scripts/agnes_image.py` | Agnes 图片生成 CLI 脚本 |
| `/Users/lcy/.hermes/.env` | 环境变量文件，包含 `AGNES_API_KEY` |
| `deploy.sh` | 构建部署脚本 |

## Agnes AI 图片生成

### API 配置
- **Base URL**: `https://apihub.agnes-ai.com/v1`
- **模型**: `agnes-image-2.1-flash`（文本生成图片）
- **API Key**: 从 `/Users/lcy/.hermes/.env` 中读取 `AGNES_API_KEY`
- **协议**: OpenAI 兼容格式

### 使用方式

方式 1：使用 CLI 脚本
```bash
export AGNES_API_KEY=$(grep AGNES_API_KEY /Users/lcy/.hermes/.env | cut -d= -f2)
python3 /Users/lcy/.hermes/skills/creative/agnes-image-gen/scripts/agnes_image.py generate \
  --prompt "YOUR_PROMPT" \
  --size "1792x1024"
```

方式 2：直接调用 API（推荐用于批量生成）
```bash
curl -X POST "https://apihub.agnes-ai.com/v1/images/generations" \
  -H "Authorization: Bearer $AGNES_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"agnes-image-2.1-flash","prompt":"YOUR_PROMPT","size":"1792x1024"}'
```
响应中包含图片 URL，下载后保存到 `blog.source/source/img/{abbrlink}.png`。

## 执行步骤

### Task 1: 配置已生成的 16 张图片

`batch_results.json` 中已有 16 张图片（部分用 abbrlink 命名如 `57802.jpg`，部分用描述性名称如 `hadoop.jpg`），都已保存在 `blog.source/source/img/` 中。

操作：
1. 读取 `batch_results.json`，获取每篇文章的 abbrlink 和图片路径
2. 在中文文章 `blog.source/source/_posts/` 中找到对应文件（通过 front-matter 中的 `abbrlink` 字段匹配）
3. 在 front-matter 中添加 `cover: /img/xxx.jpg`（在 `tags:` 行之后添加）
4. 通过 `hreflang_map.json` 找到英文对应文章的 filename
5. 在英文文章 `blog.source.en/source/_posts/` 中也添加相同的 `cover` 字段
6. 将图片复制到英文站的 `source/img/` 目录

### Task 2: 编写批量生成脚本

创建 `scripts/batch_generate_covers.py`，功能：
1. 读取 `prompts_batch.json` 获取所有待生成条目
2. 读取 `batch_results.json` 获取已完成条目，跳过已完成的
3. 按批次大小（每批 14 篇）循环：
   a. 调用 Agnes API 生成图片
   b. 下载图片到 `blog.source/source/img/{abbrlink}.png`
   c. 记录到 `batch_results.json`
   d. 在中英文文章的 front-matter 中添加 `cover` 字段
   e. 复制图片到英文站 `source/img/`
4. 支持断点续传：启动时读取 `batch_results.json`，跳过已有的

### Task 3: 分批生成图片并配置

分 5 批执行，每批约 14 篇（不含已完成的 16 篇）：

| 批次 | prompts_batch.json 索引范围 | 说明 |
|------|---------------------------|------|
| Batch 1 | #16-29 | 跳过前 16 篇（已有图片） |
| Batch 2 | #30-43 | |
| Batch 3 | #44-57 | |
| Batch 4 | #58-71 | |
| Batch 5 | #72-84 | 最后一批可能少于 14 篇 |

**每批完成后的操作流程**：
1. 确认所有图片生成成功并保存到正确路径
2. 确认中英文文章的 `cover` 字段已配置
3. 更新 `batch_results.json`
4. **向用户确认**，展示本批完成的文件列表
5. 用户确认后执行部署：`cd ~/blogs && ./deploy.sh -d`

### Task 4: 最终验证

```bash
# 检查所有文章都有 cover
cd ~/blogs/blog.source
for f in source/_posts/*.md; do
  if ! grep -q "^cover:" "$f"; then
    echo "Missing cover: $f"
  fi
done

# 检查图片文件都存在
for cover in $(grep -h "^cover:" source/_posts/*.md | sed 's/cover: \/img\///' ); do
  if [ ! -f "source/img/$cover" ]; then
    echo "Missing image: $cover"
  fi
done
```

## 图片命名规则

- 新图片统一使用 `{abbrlink}.png` 格式（如 `57802.png`）
- 尺寸：`1792x1024`（16:9 宽幅比例）
- 中英文共用同一张图，路径为 `/img/{abbrlink}.png`
- 注意：之前已生成的 16 张用的是 `.jpg` 后缀，保持一致即可

## 文章 front-matter cover 配置方式

在文章的 YAML front-matter 中，`tags:` 之后添加 `cover` 字段：

```yaml
---
title: 文章标题
date: 2026-05-28 22:00:00
categories: [技术杂谈]
tags: [hexo, blog]
abbrlink: 19890
cover: /img/19890.png
---
```

## 中英文文章对应关系

通过 `blog.source/source/_data/hreflang_map.json` 查找对应关系：
```json
{
  "53791": {
    "cn": "读书笔记-系统之美-如何面对现实中的复杂问题",
    "en": "systems-thinking-book-notes"
  }
}
```
- `cn` 是中文文章的文件名（不含 `.md`）
- `en` 是英文文章的文件名（不含 `.md`）
- 两篇文章的 front-matter 都要配置相同的 `cover` 路径

## 部署流程

每批用户确认后执行：
```bash
cd ~/blogs && ./deploy.sh -d
```
该脚本会：构建中文站 → 构建英文站 → 合并英文站到 `public/en/` → git push → Vercel 自动部署

## 断点续传机制

`batch_results.json` 是状态持久化文件：
- 每条记录包含 `abbrlink`、`filename`、`path`、`status`（可选）
- 新会话中读取该文件，跳过已有记录的文章
- 每完成一篇就追加写入，确保中断后不重复生成

## 注意事项

1. Agnes API 是免费 API，但有速率限制，每张图片生成约 3-5 秒，批次间适当间隔
2. 图片生成后需同时复制到英文站 `blog.source.en/source/img/` 目录
3. 英文文章可能不是所有中文文章都有对应翻译，hreflang_map.json 中没有的文章只需配置中文站
4. 已有 5 篇文章（云原生、k8s 实践、AI agent 工作流、读干法、redis-cluster）使用的是描述性图片名（如 `cloud-native-arch.jpg`），不在本次 85 篇范围内
