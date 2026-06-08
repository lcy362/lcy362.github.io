#!/usr/bin/env python3
"""
批量生成博客文章标题图并配置到中英文文章中。

用法：
  # 生成下一批（默认 14 篇）
  python3 scripts/batch_generate_covers.py

  # 指定批次大小
  python3 scripts/batch_generate_covers.py --batch 10

  # 仅预览待处理文章（不生成）
  python3 scripts/batch_generate_covers.py --dry-run

  # 从指定索引开始
  python3 scripts/batch_generate_covers.py --start 20

断点续传：自动读取 batch_results.json，跳过已完成的条目。
"""

import argparse
import base64
import json
import os
import re
import shutil
import sys
import time
import urllib.error
import urllib.request

# === 路径配置 ===
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
PROMPTS_FILE = os.path.join(PROJECT_ROOT, "prompts_batch.json")
RESULTS_FILE = os.path.join(PROJECT_ROOT, "batch_results.json")
CN_POSTS_DIR = os.path.join(PROJECT_ROOT, "blog.source", "source", "_posts")
EN_POSTS_DIR = os.path.join(PROJECT_ROOT, "blog.source.en", "source", "_posts")
CN_IMG_DIR = os.path.join(PROJECT_ROOT, "blog.source", "source", "img")
EN_IMG_DIR = os.path.join(PROJECT_ROOT, "blog.source.en", "source", "img")
HREFLANG_FILE = os.path.join(
    PROJECT_ROOT, "blog.source", "source", "_data", "hreflang_map.json"
)

# === Agnes API 配置 ===
API_BASE = "https://apihub.agnes-ai.com/v1"
API_MODEL = "agnes-image-2.1-flash"
IMAGE_SIZE = "1792x1024"


def load_api_key():
    """从 .env 文件读取 AGNES_API_KEY。"""
    env_paths = [
        os.path.expanduser("~/.hermes/.env"),
        os.path.join(PROJECT_ROOT, ".env"),
    ]
    for env_path in env_paths:
        if os.path.exists(env_path):
            with open(env_path, "r") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("AGNES_API_KEY="):
                        key = line.split("=", 1)[1].strip().strip("\"'")
                        if key:
                            return key
    # 也检查环境变量
    key = os.environ.get("AGNES_API_KEY")
    if key:
        return key
    print("错误: 找不到 AGNES_API_KEY。请检查 ~/.hermes/.env 或设置环境变量。")
    sys.exit(1)


def load_json(filepath):
    """加载 JSON 文件。"""
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(filepath, data):
    """保存 JSON 文件。"""
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def get_completed_abbrlinks(results):
    """从 batch_results.json 获取已完成的 abbrlink 集合。"""
    completed = set()
    for r in results:
        if "abbrlink" in r:
            completed.add(str(r["abbrlink"]))
    return completed


def find_cn_article(abbrlink):
    """通过 abbrlink 查找中文文章文件路径。"""
    for fname in os.listdir(CN_POSTS_DIR):
        if not fname.endswith(".md"):
            continue
        fpath = os.path.join(CN_POSTS_DIR, fname)
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read(2000)
        if re.search(rf"^abbrlink:\s*{abbrlink}\s*$", content, re.MULTILINE):
            return fpath
    return None


def find_en_article(abbrlink, hreflang_map):
    """通过 abbrlink 和 hreflang 映射查找英文文章文件路径。"""
    abbr_str = str(abbrlink)
    if abbr_str not in hreflang_map:
        return None
    en_slug = hreflang_map[abbr_str]["en"]
    en_path = os.path.join(EN_POSTS_DIR, f"{en_slug}.md")
    if os.path.exists(en_path):
        return en_path
    return None


def generate_image(api_key, prompt):
    """调用 Agnes API 生成图片，返回图片 URL 或 base64 数据。"""
    payload = {
        "model": API_MODEL,
        "prompt": prompt,
        "size": IMAGE_SIZE,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{API_BASE}/images/generations", data=data, headers=headers, method="POST"
    )

    with urllib.request.urlopen(req, timeout=120) as resp:
        result = json.loads(resp.read().decode("utf-8"))

    if "data" in result and len(result["data"]) > 0:
        image_data = result["data"][0]
        return image_data.get("url"), image_data.get("b64_json")
    return None, None


def download_image(url, save_path):
    """从 URL 下载图片到本地。"""
    with urllib.request.urlopen(url, timeout=120) as resp:
        with open(save_path, "wb") as f:
            f.write(resp.read())


def save_b64_image(b64_data, save_path):
    """保存 base64 编码的图片。"""
    with open(save_path, "wb") as f:
        f.write(base64.b64decode(b64_data))


def add_cover_to_frontmatter(filepath, cover_path):
    """在文章 front-matter 中添加 cover 字段。已存在则跳过。"""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    if re.search(r"^cover:", content, re.MULTILINE):
        return False  # 已有 cover

    if not content.startswith("---"):
        return False  # 无 front-matter

    # 找到 front-matter 结束位置
    end_idx = content.index("---", 3)
    frontmatter = content[3:end_idx]
    body = content[end_idx + 3 :]

    # 在 abbrlink 行之后插入 cover
    if re.search(r"^abbrlink:", frontmatter, re.MULTILINE):
        frontmatter = re.sub(
            r"^(abbrlink:.*)$",
            rf"\1\ncover: {cover_path}",
            frontmatter,
            count=1,
            flags=re.MULTILINE,
        )
    else:
        frontmatter = frontmatter.rstrip() + f"\ncover: {cover_path}\n"

    new_content = "---" + frontmatter + "---" + body
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    return True


def process_single(api_key, entry, hreflang_map, results):
    """处理单篇文章：生成图片 + 配置 cover。返回 True 表示成功。"""
    abbrlink = str(entry["abbrlink"])
    prompt = entry["prompt"]
    cover_path = f"/img/{abbrlink}.png"
    cn_img_path = os.path.join(CN_IMG_DIR, f"{abbrlink}.png")

    # 1. 生成图片
    print(f"  生成图片中... (prompt: {prompt[:60]}...)")
    try:
        img_url, b64_data = generate_image(api_key, prompt)
    except Exception as e:
        print(f"  ❌ API 调用失败: {e}")
        return False

    if img_url:
        print(f"  下载图片: {img_url[:80]}...")
        try:
            download_image(img_url, cn_img_path)
        except Exception as e:
            print(f"  ❌ 下载失败: {e}")
            return False
    elif b64_data:
        save_b64_image(b64_data, cn_img_path)
    else:
        print("  ❌ API 返回格式异常")
        return False

    print(f"  ✅ 图片保存: {cn_img_path}")

    # 2. 复制到英文站
    en_img_path = os.path.join(EN_IMG_DIR, f"{abbrlink}.png")
    shutil.copy2(cn_img_path, en_img_path)

    # 3. 配置中文文章 cover
    cn_article = find_cn_article(abbrlink)
    if cn_article:
        if add_cover_to_frontmatter(cn_article, cover_path):
            print(f"  ✅ CN 文章已配置: {os.path.basename(cn_article)}")
        else:
            print(f"  ⏭️  CN 文章已有 cover")
    else:
        print(f"  ⚠️  未找到中文文章 (abbrlink={abbrlink})")

    # 4. 配置英文文章 cover
    en_article = find_en_article(abbrlink, hreflang_map)
    if en_article:
        if add_cover_to_frontmatter(en_article, cover_path):
            print(f"  ✅ EN 文章已配置: {os.path.basename(en_article)}")
        else:
            print(f"  ⏭️  EN 文章已有 cover")
    else:
        print(f"  ⚠️  未找到对应英文文章 (abbrlink={abbrlink})")

    # 5. 更新 batch_results.json
    results.append(
        {
            "abbrlink": abbrlink,
            "filename": entry["filename"],
            "path": cover_path,
            "status": "done",
        }
    )
    save_json(RESULTS_FILE, results)

    return True


def main():
    parser = argparse.ArgumentParser(description="批量生成博客文章标题图")
    parser.add_argument(
        "--batch", type=int, default=14, help="每批处理的篇数 (默认: 14)"
    )
    parser.add_argument(
        "--start", type=int, default=0, help="从 prompts_batch.json 的哪个索引开始 (默认: 0)"
    )
    parser.add_argument(
        "--dry-run", action="store_true", help="仅预览待处理文章，不执行生成"
    )
    args = parser.parse_args()

    # 加载数据
    prompts = load_json(PROMPTS_FILE)
    results = load_json(RESULTS_FILE) if os.path.exists(RESULTS_FILE) else []
    hreflang_map = load_json(HREFLANG_FILE)

    completed = get_completed_abbrlinks(results)
    api_key = load_api_key() if not args.dry_run else "DRY_RUN"

    # 筛选待处理条目
    pending = []
    for i, entry in enumerate(prompts):
        if i < args.start:
            continue
        abbrlink = str(entry["abbrlink"])
        if abbrlink not in completed:
            pending.append(entry)

    if not pending:
        print("🎉 所有文章的标题图都已配置完成！")
        return

    # 取本批次
    batch = pending[: args.batch]
    print(f"\n{'=' * 60}")
    print(f"待处理: {len(pending)} 篇 | 本批次: {len(batch)} 篇 | 已完成: {len(completed)} 篇")
    print(f"{'=' * 60}\n")

    for i, entry in enumerate(batch):
        abbrlink = entry["abbrlink"]
        title = entry.get("title", entry["filename"])
        print(f"[{i + 1}/{len(batch)}] abbrlink={abbrlink} | {title}")

        if args.dry_run:
            # 检查中英文文章是否存在
            cn = find_cn_article(str(abbrlink))
            en = find_en_article(str(abbrlink), hreflang_map)
            print(f"  CN: {os.path.basename(cn) if cn else '❌ 未找到'}")
            print(f"  EN: {os.path.basename(en) if en else '⚠️ 无对应英文文章'}")
            continue

        success = process_single(api_key, entry, hreflang_map, results)
        if success:
            print(f"  🎉 完成!\n")
        else:
            print(f"  ❌ 失败，跳过\n")

        # 批次间间隔，避免 API 限流
        if i < len(batch) - 1:
            time.sleep(1)

    if not args.dry_run:
        done_total = len(get_completed_abbrlinks(load_json(RESULTS_FILE)))
        print(f"\n{'=' * 60}")
        print(f"本批完成: {len(batch)} 篇")
        print(f"总计完成: {done_total}/{len(prompts)} 篇")
        print(f"剩余: {len(prompts) - done_total} 篇")
        print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
