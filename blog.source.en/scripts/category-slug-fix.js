/**
 * category-slug-fix.js
 * Fixes EN site category and tag pages to use lowercase slugs.
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

// Override tag generator to use lowercase slugs
hexo.extend.generator.register('tag', function(locals) {
  var config = this.config;
  var tags = locals.tags;
  
  if (!tags || !tags.length) return [];
  
  var result = [];
  var perPage = config.tag_generator.per_page || 10;
  var paginationDir = config.tag_generator.pagination_dir || 'page';
  
  tags.forEach(function(tag) {
    if (!tag.length) return;
    
    var tagSlug = tag.name.toLowerCase().replace(/\s+/g, '-');
    var tagPath = 'tags/' + tagSlug + '/';
    
    var posts = tag.posts.sort('-date');
    var totalPosts = posts.length;
    var totalPages = Math.ceil(totalPosts / perPage);
    
    result.push({
      path: tagPath + 'index.html',
      layout: ['tag', 'archive', 'index'],
      data: {
        tag: tag.name,
        posts: posts.slice(0, perPage)
      }
    });
    
    for (var i = 2; i <= totalPages; i++) {
      result.push({
        path: tagPath + paginationDir + '/' + i + '/index.html',
        layout: ['tag', 'archive', 'index'],
        data: {
          tag: tag.name,
          posts: posts.slice((i - 1) * perPage, i * perPage)
        }
      });
    }
  });
  
  return result;
}, 15);

// Fix links in categories and tags index pages
hexo.extend.filter.register('after_render:html', function(html, data) {
  // Fix category and tag links in all HTML pages
  if (data.path && data.path.endsWith('.html')) {
    html = html.replace(/\/categories\/([A-Z][\w-]*)\//g, function(match, slug) {
      return '/categories/' + slug.toLowerCase() + '/';
    });
    html = html.replace(/\/tags\/([A-Z][\w-]*)\//g, function(match, slug) {
      return '/tags/' + slug.toLowerCase() + '/';
    });
  }
  return html;
});
