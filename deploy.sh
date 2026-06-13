#!/bin/bash
# Quartz 博客部署脚本
# 用法：cd /Users/lain/Documents/quartz-blog && bash deploy.sh
# 作用：本地构建 Quartz，然后将构建产物提交到 GitHub Pages

set -e

echo "🚀 开始部署 Quartz 博客..."

# 1. 构建
echo "📦 构建静态网站..."
npx quartz build

# 2. 确保 public 目录存在且有内容
if [ ! -f "public/index.html" ]; then
  echo "❌ 构建失败：public/index.html 不存在"
  exit 1
fi

# 3. 复制 public 内容到根目录
echo "📋 复制构建产物到根目录..."
rsync -a --exclude='.git' public/ ./

# 4. 添加所有变更（构建产物 + 源文件）
echo "📝 提交到 Git..."
git add -A 2>/dev/null || true

# 5. 提交并推送
git commit -m "deploy: 自动部署博客 $(date '+%Y-%m-%d %H:%M')" || echo "ℹ️ 没有新的更改需要提交"
git push origin main

echo "✅ 部署完成！"
echo "🌐 https://obsidian-blog-auth.huaqiangsellsmelons.workers.dev"
