/**
 * keywords-meta.js
 * Injects <meta name="keywords"> from article tags
 * Baidu may still reference keywords meta; Google ignores it
 */
hexo.extend.filter.register('after_render:html', function(html, data) {
  var path = data.path || '';
  
  // Only process article pages (posts/xxx/)
  if (!/^posts\/[\w-]+\/index\.html$/.test(path)) {
    return html;
  }
  
  var page = data.page || {};
  var tags = page.tags;
  
  if (!tags || tags.length === 0) {
    return html;
  }
  
  // Collect tag names
  var keywords = tags.map(function(tag) {
    return tag.name;
  }).join(', ');
  
  // Inject keywords meta tag before </head>
  var keywordsTag = '<meta name="keywords" content="' + keywords + '">';
  html = html.replace('</head>', keywordsTag + '\n</head>');
  
  return html;
});
