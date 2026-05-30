/**
 * category-slug-fix.js
 * Fixes EN site category pages to use lowercase slugs.
 */
'use strict';

var fs = require('fs');
var path = require('path');

// Override category generator to use lowercase slugs
hexo.extend.generator.register('category', function(locals) {
  var config = this.config;
  var categories = locals.categories;
  
  if (!categories || !categories.length) return [];
  
  var result = [];
  var perPage = config.category_generator.per_page || 10;
  var paginationDir = config.category_generator.pagination_dir || 'page';
  
  categories.forEach(function(cat) {
    if (!cat.length) return;
    
    var catSlug = cat.name.toLowerCase().replace(/\s+/g, '-');
    var catPath = 'categories/' + catSlug + '/';
    
    var posts = cat.posts.sort('-date');
    var totalPosts = posts.length;
    var totalPages = Math.ceil(totalPosts / perPage);
    
    result.push({
      path: catPath + 'index.html',
      layout: ['category', 'archive', 'index'],
      data: {
        category: cat.name,
        posts: posts.slice(0, perPage)
      }
    });
    
    for (var i = 2; i <= totalPages; i++) {
      result.push({
        path: catPath + paginationDir + '/' + i + '/index.html',
        layout: ['category', 'archive', 'index'],
        data: {
          category: cat.name,
          posts: posts.slice((i - 1) * perPage, i * perPage)
        }
      });
    }
  });
  
  return result;
}, 15);

// Fix links in categories index page
hexo.extend.filter.register('after_render:html', function(html, data) {
  if (data.path === 'categories/index.html') {
    html = html.replace(/\/categories\/([A-Z][\w-]*)\//g, function(match, slug) {
      return '/categories/' + slug.toLowerCase() + '/';
    });
  }
  return html;
});

// Fix sitemap after generation by modifying the file directly
hexo.extend.filter.register('after_generate', function() {
  var sitemapPath = path.join(this.public_dir, 'sitemap.xml');
  
  if (!fs.existsSync(sitemapPath)) return;
  
  var content = fs.readFileSync(sitemapPath, 'utf-8');
  var modified = content.replace(/\/categories\/([A-Z][\w-]*)\//g, function(match, slug) {
    return '/categories/' + slug.toLowerCase() + '/';
  });
  
  if (content !== modified) {
    fs.writeFileSync(sitemapPath, modified, 'utf-8');
    hexo.log.info('Fixed category URLs in sitemap.xml to lowercase');
  }
});
