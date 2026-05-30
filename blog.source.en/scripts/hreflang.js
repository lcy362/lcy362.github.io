/**
 * Hexo 脚本：动态生成 hreflang 标签
 * 
 * 功能：
 * 1. 根据当前页面类型生成正确的 hreflang
 * 2. 文章页：指向对应语言版本的文章
 * 3. 首页/分类页/标签页：指向对应的语言版本
 * 4. 同时支持中文站和英文站
 */

'use strict';

const fs = require('fs');
const path = require('path');

// 读取 hreflang 映射
function loadHreflangMap(hexo) {
  const mapPath = path.join(hexo.source_dir, '_data', 'hreflang_map.json');
  try {
    if (fs.existsSync(mapPath)) {
      return JSON.parse(fs.readFileSync(mapPath, 'utf-8'));
    }
  } catch (e) {
    hexo.log.warn('Failed to load hreflang_map.json:', e.message);
  }
  return {};
}

// 根据 abbrlink 反查 slug
function findSlugByAbbrlink(map, abbrlink, lang) {
  const entry = map[abbrlink];
  if (entry && entry[lang]) {
    return entry[lang];
  }
  return null;
}

// 注册 filter，在 HTML 生成后注入 hreflang
hexo.extend.filter.register('after_render:html', function(html, data) {
  const isEnSite = this.config.root === '/en/';
  
  const hreflangMap = loadHreflangMap(this);
  if (Object.keys(hreflangMap).length === 0) {
    return html;
  }

  // 基础 URL（不含 /en/ 前缀）
  const baseUrl = 'https://lichuanyang.top';
  const page = data.page || {};
  
  let hreflangTags = '';

  // 判断页面类型
  if (page.layout === 'post' && page.abbrlink) {
    // 文章页：根据 abbrlink 找到对应语言版本
    const cnSlug = findSlugByAbbrlink(hreflangMap, page.abbrlink, 'cn');
    const enSlug = findSlugByAbbrlink(hreflangMap, page.abbrlink, 'en');
    
    if (cnSlug) {
      hreflangTags += `<link rel="alternate" hreflang="zh-CN" href="${baseUrl}/posts/${page.abbrlink}/"/>\n`;
    }
    if (enSlug) {
      hreflangTags += `<link rel="alternate" hreflang="en" href="${baseUrl}/en/posts/${page.abbrlink}/"/>\n`;
    }
    // x-default 指向中文版（主语言）
    hreflangTags += `<link rel="alternate" hreflang="x-default" href="${baseUrl}/posts/${page.abbrlink}/"/>\n`;
    
  } else if (page.layout === 'page') {
    // 独立页面（关于、分类等）
    const pagePath = page.path || '';
    
    // 检查是否有英文对应
    if (pagePath === 'about/index.html' || pagePath === 'about/') {
      hreflangTags += `<link rel="alternate" hreflang="zh-CN" href="${baseUrl}/about/"/>\n`;
      hreflangTags += `<link rel="alternate" hreflang="en" href="${baseUrl}/en/about/"/>\n`;
      hreflangTags += `<link rel="alternate" hreflang="x-default" href="${baseUrl}/about/"/>\n`;
    }
    // 其他页面可以继续添加
    
  } else {
    // 首页、分类页、标签页、归档页等
    const currentPath = (page.path || data.path || '').replace(/index\.html$/, '');
    
    // 首页
    if (currentPath === '' || currentPath === '/' || currentPath === '/en/' || currentPath === '/en') {
      hreflangTags += `<link rel="alternate" hreflang="zh-CN" href="${baseUrl}/"/>\n`;
      hreflangTags += `<link rel="alternate" hreflang="en" href="${baseUrl}/en/"/>\n`;
      hreflangTags += `<link rel="alternate" hreflang="x-default" href="${baseUrl}/"/>\n`;
    }
    // 分类页、标签页、归档页 - 这些通常没有英文对应，只添加自身语言
    // 如果需要可以后续扩展
  }

  // 注入 hreflang 到 </head> 之前
  if (hreflangTags) {
    html = html.replace('</head>', `${hreflangTags}</head>`);
  }

  return html;
});
