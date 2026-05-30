#!/bin/bash
# Hexo 博客部署脚本
# 用法: ./deploy.sh [选项]
#   -s, --serve    本地预览（默认）
#   -d, --deploy   发布到 GitHub
#   -c, --clean    清理后重新构建
#   -h, --help     显示帮助信息

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 博客目录（相对于脚本所在目录）
CN_DIR="blog.source"
EN_DIR="blog.source.en"

# 默认动作
ACTION="serve"
CLEAN=false

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--serve)
            ACTION="serve"
            shift
            ;;
        -d|--deploy)
            ACTION="deploy"
            shift
            ;;
        -c|--clean)
            CLEAN=true
            shift
            ;;
        -h|--help)
            echo "Hexo 博客部署脚本"
            echo ""
            echo "用法: ./deploy.sh [选项]"
            echo "  -s, --serve    本地预览（默认）"
            echo "  -d, --deploy   发布到 GitHub"
            echo "  -c, --clean    清理后重新构建"
            echo "  -h, --help     显示帮助信息"
            echo ""
            echo "示例:"
            echo "  ./deploy.sh          # 本地预览"
            echo "  ./deploy.sh -d       # 发布到 GitHub"
            echo "  ./deploy.sh -c -d    # 清理后发布"
            exit 0
            ;;
        *)
            echo -e "${RED}未知参数: $1${NC}"
            exit 1
            ;;
    esac
done

# 检查目录是否存在
if [ ! -d "$CN_DIR" ]; then
    echo -e "${RED}错误: 中文博客目录不存在: $CN_DIR${NC}"
    exit 1
fi
if [ ! -d "$EN_DIR" ]; then
    echo -e "${RED}错误: 英文博客目录不存在: $EN_DIR${NC}"
    exit 1
fi

# 构建中文版
echo -e "${GREEN}[1/4] 构建中文版...${NC}"
cd "$CN_DIR"
if [ "$CLEAN" = true ]; then
    hexo clean
fi
hexo generate
cd ..

# 构建英文版
echo -e "${GREEN}[2/4] 构建英文版...${NC}"
cd "$EN_DIR"
if [ "$CLEAN" = true ]; then
    hexo clean
fi
hexo generate
cd ..

# 合并英文版到中文版
echo -e "${GREEN}[3/4] 合并英文版到 public/en/...${NC}"
mkdir -p "$CN_DIR/public/en"
cp -r "$EN_DIR/public/." "$CN_DIR/public/en/"

# 执行动作
echo -e "${GREEN}[4/4] 执行 ${ACTION}...${NC}"
cd "$CN_DIR"
if [ "$ACTION" = "serve" ]; then
    echo -e "${YELLOW}启动本地预览服务器...${NC}"
    hexo server
elif [ "$ACTION" = "deploy" ]; then
    echo -e "${YELLOW}发布到 GitHub...${NC}"
    hexo deploy
    echo -e "${GREEN}发布完成！${NC}"
fi
