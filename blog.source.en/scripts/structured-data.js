/**
 * structured-data.js
 * Enhances structured data (JSON-LD) on article pages:
 * 1. Adds BreadcrumbList schema
 * 2. Adds author.sameAs to BlogPosting schema
 */
hexo.extend.filter.register('after_render:html', function(html, data) {
  var path = data.path || '';
  
  // Only process article pages (posts/xxx/)
  if (!/^posts\/[\w-]+\/index\.html$/.test(path)) {
    return html;
  }
  
  var config = this.config;
  var page = data.page || {};
  
  // Build BreadcrumbList
  var breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': config.title || 'Home',
        'item': config.url + (config.root || '/')
      }
    ]
  };
  
  // Add category as intermediate breadcrumb if available
  if (page.categories && page.categories.length > 0) {
    var cat = page.categories.data[0];
    if (cat) {
      breadcrumb.itemListElement.push({
        '@type': 'ListItem',
        'position': 2,
        'name': cat.name,
        'item': config.url + '/' + cat.path
      });
    }
  }
  
  // Add article as final breadcrumb
  breadcrumb.itemListElement.push({
    '@type': 'ListItem',
    'position': breadcrumb.itemListElement.length + 1,
    'name': page.title || 'Article',
    'item': config.url + '/' + path.replace(/index\.html$/, '')
  });
  
  // SameAs links for author
  var sameAs = [
    'https://github.com/lcy362',
    'https://stackoverflow.com/users/3448633',
    'https://www.zhihu.com/people/hobermallow'
  ];
  
  // Patch existing BlogPosting schema to add author.sameAs
  html = html.replace(
    /"@type"\s*:\s*"Person"([\s\S]*?)"url"\s*:\s*"[^"]*"/g,
    function(match, between) {
      if (match.indexOf('sameAs') === -1) {
        return match + ',\n      "sameAs": ' + JSON.stringify(sameAs);
      }
      return match;
    }
  );
  
  // Inject BreadcrumbList before </head>
  var breadcrumbScript = '<script type="application/ld+json">' + JSON.stringify(breadcrumb) + '</script>';
  html = html.replace('</head>', breadcrumbScript + '\n</head>');
  
  return html;
});
