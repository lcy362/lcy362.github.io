#!/bin/bash
# 更新 hreflang_map.json 映射文件
# 用途：新增中英文文章后运行此脚本，更新 hreflang 映射
# 
# 使用方法：
#   ./scripts/update_hreflang_map.sh
#
# 注意：此脚本会同时更新 blog.source 和 blog.source.en 下的 hreflang_map.json

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BLOG_DIR="$(dirname "$SCRIPT_DIR")"

CN_DIR="$BLOG_DIR/blog.source"
EN_DIR="$BLOG_DIR/blog.source.en"

echo "📝 更新 hreflang_map.json..."

python3 << 'EOF'
import re
import json
from pathlib import Path

def extract_abbrlink(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            match = re.search(r'^abbrlink:\s*(\d+)', content, re.MULTILINE)
            if match:
                return match.group(1)
    except:
        pass
    return None

# 读取文章
cn_dir = Path("blog.source/source/_posts")
en_dir = Path("blog.source.en/source/_posts")

cn_articles = {}
for f in cn_dir.glob("*.md"):
    abbrlink = extract_abbrlink(f)
    if abbrlink:
        cn_articles[abbrlink] = f.stem

en_articles = {}
for f in en_dir.glob("*.md"):
    abbrlink = extract_abbrlink(f)
    if abbrlink:
        en_articles[abbrlink] = f.stem

# 构建映射
all_abbrlinks = set(cn_articles.keys()) | set(en_articles.keys())
hreflang_map = {}

for abbrlink in all_abbrlinks:
    hreflang_map[abbrlink] = {
        "cn": cn_articles.get(abbrlink),
        "en": en_articles.get(abbrlink)
    }

# 保存到两个站点
for output_dir in [Path("blog.source/source/_data"), Path("blog.source.en/source/_data")]:
    output_dir.mkdir(exist_ok=True)
    output_path = output_dir / "hreflang_map.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(hreflang_map, f, ensure_ascii=False, indent=2)

# 统计
cn_only = sum(1 for v in hreflang_map.values() if v['cn'] and not v['en'])
en_only = sum(1 for v in hreflang_map.values() if not v['cn'] and v['en'])
both = sum(1 for v in hreflang_map.values() if v['cn'] and v['en'])

print(f"✅ 更新完成: {len(hreflang_map)} 条映射")
print(f"   中英文都有: {both}")
print(f"   仅中文: {cn_only}")
print(f"   仅英文: {en_only}")
EOF

echo ""
echo "📁 已更新文件:"
echo "   - blog.source/source/_data/hreflang_map.json"
echo "   - blog.source.en/source/_data/hreflang_map.json"
