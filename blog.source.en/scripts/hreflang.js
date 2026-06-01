/**
 * Hexo 脚本：动态生成 hreflang 标签
 * 
 * 功能：
 * 1. 根据当前页面类型生成正确的 hreflang
 * 2. 文章页：指向对应语言版本的文章
 * 3. 首页：指向对应的语言版本
 * 4. 分类页：通过映射表指向对应语言版本
 * 5. 同时支持中文站和英文站
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

// 中英文分类名称映射
// key: 中文分类名, value: 英文分类 slug（小写+连字符）
const CATEGORY_MAP = {
  '技术杂谈': 'tech-talk',
  'Java': 'java',
  '消息队列': 'message-queue',
  'activemq系列文章': 'activemq-series',
  '数据库': 'database',
  '大数据': 'big-data',
  'AI实践': 'ai-practice',
  'jstorm源码解析': 'jstorm-source-code-analysis',
  '云原生': 'cloud-native',
  '算法': 'algorithm',
  'redis系列': 'redis-series',
  '分布式系统模式系列': 'distributed-systems-patterns-series',
  '读书笔记': 'book-notes',
  '架构设计': 'architecture-design'
};

// 反向映射：英文 slug → 中文分类名
const CATEGORY_MAP_REVERSE = {};
for (const [cn, en] of Object.entries(CATEGORY_MAP)) {
  CATEGORY_MAP_REVERSE[en] = cn;
}

// 根据分类名获取对应的英文 slug
function getEnCategorySlug(cnName) {
  return CATEGORY_MAP[cnName] || null;
}

// 根据英文 slug 获取对应的中文分类名
function getCnCategoryName(enSlug) {
  return CATEGORY_MAP_REVERSE[enSlug] || null;
}

// 中英文标签名称映射（仅映射两个站点共有的标签）
// key: 中文标签名, value: 英文标签 slug（小写+连字符）
const TAG_MAP = {
  'ACID': 'acid',
  'AI': 'ai',
  'AI Agent': 'ai-agent',
  'LDA': 'lda',
  'LLM': 'llm',
  'RTB': 'rtb',
  'Tampermonkey': 'tampermonkey',
  'Vercel': 'vercel',
  'activemq': 'activemq',
  'automation': 'automation',
  'blog': 'blog',
  'camel': 'camel',
  'clickhouse': 'clickhouse',
  'grafana': 'grafana',
  'hadoop': 'hadoop',
  'hawtio': 'hawtio',
  'hbase': 'hbase',
  'hexo': 'hexo',
  'i18n': 'i18n',
  'iterm2': 'iterm2',
  'java': 'java',
  'json': 'json',
  'jstorm': 'jstorm',
  'kafka': 'kafka',
  'kubernetes': 'kubernetes',
  'leetcode': 'leetcode',
  'lua': 'lua',
  'maven': 'maven',
  'mysql': 'mysql',
  'prometheus': 'prometheus',
  'protobuf': 'protobuf',
  'redis': 'redis',
  'redis-cluster': 'redis-cluster',
  'rocketMq': 'rocketmq',
  'springboot': 'springboot',
  'storm': 'storm',
  'vaadin': 'vaadin',
  'wiki': 'wiki',
  'zookeeper': 'zookeeper'
};

// 反向映射：英文 slug → 中文标签名
const TAG_MAP_REVERSE = {};
for (const [cn, en] of Object.entries(TAG_MAP)) {
  TAG_MAP_REVERSE[en] = cn;
}

// 根据中文标签名获取对应的英文 slug
function getEnTagSlug(cnName) {
  return TAG_MAP[cnName] || null;
}

// 根据英文 slug 获取对应的中文标签名
function getCnTagName(enSlug) {
  return TAG_MAP_REVERSE[enSlug] || null;
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
    
  } else if (data.category || (page.path && /^categories\//.test(page.path))) {
    // 分类页面（通过 data.category 或 path 检测）
    const categoryName = data.category || page.category || '';
    const pagePath = page.path || data.path || '';
    
    if (isEnSite) {
      // 英文站分类页：当前 slug 是小写形式（如 tech-talk）
      const currentSlug = pagePath
        .replace(/^categories\//, '')
        .replace(/\/index\.html$/, '')
        .replace(/\/$/, '');
      
      const cnName = getCnCategoryName(currentSlug);
      if (cnName) {
        const cnSlug = encodeURIComponent(cnName);
        hreflangTags += `<link rel="alternate" hreflang="zh-CN" href="${baseUrl}/categories/${cnSlug}/"/>\n`;
        hreflangTags += `<link rel="alternate" hreflang="en" href="${baseUrl}/en/categories/${currentSlug}/"/>\n`;
        hreflangTags += `<link rel="alternate" hreflang="x-default" href="${baseUrl}/categories/${cnSlug}/"/>\n`;
      }
    } else {
      // 中文站分类页：categoryName 是中文名（如 "技术杂谈"）
      const enSlug = getEnCategorySlug(categoryName);
      if (enSlug) {
        const cnSlug = encodeURIComponent(categoryName);
        hreflangTags += `<link rel="alternate" hreflang="zh-CN" href="${baseUrl}/categories/${cnSlug}/"/>\n`;
        hreflangTags += `<link rel="alternate" hreflang="en" href="${baseUrl}/en/categories/${enSlug}/"/>\n`;
        hreflangTags += `<link rel="alternate" hreflang="x-default" href="${baseUrl}/categories/${cnSlug}/"/>\n`;
      }
    }
    
  } else {
    // 首页、标签页、归档页等
    const currentPath = (page.path || data.path || '').replace(/index\.html$/, '');
    
    // 首页
    if (currentPath === '' || currentPath === '/' || currentPath === '/en/' || currentPath === '/en') {
      hreflangTags += `<link rel="alternate" hreflang="zh-CN" href="${baseUrl}/"/>\n`;
      hreflangTags += `<link rel="alternate" hreflang="en" href="${baseUrl}/en/"/>\n`;
      hreflangTags += `<link rel="alternate" hreflang="x-default" href="${baseUrl}/"/>\n`;
    }
    // 标签页
    if (/^tags\//.test(currentPath)) {
      if (isEnSite) {
        // 英文站标签页：当前 slug 是小写形式（如 ai-agent）
        const currentSlug = currentPath
          .replace(/^tags\//, '')
          .replace(/\/index\.html$/, '')
          .replace(/\/$/, '');
        
        const cnName = getCnTagName(currentSlug);
        if (cnName) {
          const cnSlug = encodeURIComponent(cnName);
          hreflangTags += `<link rel="alternate" hreflang="zh-CN" href="${baseUrl}/tags/${cnSlug}/"/>\n`;
          hreflangTags += `<link rel="alternate" hreflang="en" href="${baseUrl}/en/tags/${currentSlug}/"/>\n`;
          hreflangTags += `<link rel="alternate" hreflang="x-default" href="${baseUrl}/tags/${cnSlug}/"/>\n`;
        }
      } else {
        // 中文站标签页：需要从页面获取标签名
        const tagName = page.tag || page.name || '';
        const enSlug = getEnTagSlug(tagName);
        if (enSlug) {
          const cnSlug = encodeURIComponent(tagName);
          hreflangTags += `<link rel="alternate" hreflang="zh-CN" href="${baseUrl}/tags/${cnSlug}/"/>\n`;
          hreflangTags += `<link rel="alternate" hreflang="en" href="${baseUrl}/en/tags/${enSlug}/"/>\n`;
          hreflangTags += `<link rel="alternate" hreflang="x-default" href="${baseUrl}/tags/${cnSlug}/"/>\n`;
        }
      }
    }
  }

  // 注入 hreflang 到 </head> 之前
  if (hreflangTags) {
    html = html.replace('</head>', `${hreflangTags}</head>`);
  }

  return html;
});
