/**
 * related-faq.js
 * Injects a "Related Q&A" section after the existing relatedPosts widget.
 * 
 * Matching logic:
 * 1. Same category → +3 weight
 * 2. Shared tags → +1 weight per shared tag
 * 3. Only includes articles that have front-matter `faq:` defined
 * 4. Excludes current article
 * 
 * Front-matter: faq: [{q: "question"}]
 */
hexo.extend.filter.register('after_render:html', function(html, data) {
  var path = data.path || '';
  var page = data.page || {};

  // Only process article pages
  if (!/^posts\/[\w-]+\/index\.html$/.test(path)) {
    return html;
  }

  var site = this.model('Post');
  var currentCategories = (page.categories && page.categories.data) ? 
    page.categories.data.map(function(c) { return c.name; }) : [];
  var currentTags = (page.tags && page.tags.data) ? 
    page.tags.data.map(function(t) { return t.name; }) : [];

  // Collect all articles that have faq front-matter
  var candidates = [];
  site.forEach(function(post) {
    // Skip self
    if (post._id === page._id) return;
    // Only include posts with FAQ
    if (!post.faq || !Array.isArray(post.faq) || post.faq.length === 0) return;

    var weight = 0;

    // Category match
    if (post.categories && post.categories.data) {
      for (var i = 0; i < post.categories.data.length; i++) {
        if (currentCategories.indexOf(post.categories.data[i].name) !== -1) {
          weight += 3;
        }
      }
    }

    // Tag match
    if (post.tags && post.tags.data) {
      for (var i = 0; i < post.tags.data.length; i++) {
        if (currentTags.indexOf(post.tags.data[i].name) !== -1) {
          weight += 1;
        }
      }
    }

    // Only include if there's at least some relevance (same category or shared tag)
    if (weight > 0) {
      candidates.push({
        title: post.title,
        path: post.path,
        faq: post.faq.slice(0, 3), // Max 3 questions per article
        weight: weight,
        date: post.date
      });
    }
  });

  // Sort by weight desc, then date desc
  candidates.sort(function(a, b) {
    if (b.weight !== a.weight) return b.weight - a.weight;
    return b.date - a.date;
  });

  // Take top 4 articles
  candidates = candidates.slice(0, 4);

  if (candidates.length === 0) return html;

  // Build FAQ items HTML
  var faqItemsHtml = '';
  var config = this.config;
  var baseUrl = config.url;

  for (var c = 0; c < candidates.length; c++) {
    var candidate = candidates[c];
    var questions = candidate.faq.slice(0, 3);
    var answerLink = baseUrl + '/' + candidate.path;

    faqItemsHtml += '<div class="relatedFaq-item">' +
      '<a class="relatedFaq-title" href="' + answerLink + '">' + candidate.title + '</a>' +
      '<ul class="relatedFaq-questions">';

    for (var q = 0; q < questions.length; q++) {
      var qText = typeof questions[q] === 'string' ? questions[q] : questions[q].q;
      faqItemsHtml += '<li><a href="' + answerLink + '">' + qText + '</a></li>';
    }

    faqItemsHtml += '</ul></div>';
  }

  var faqSection = 
    '<div class="relatedPosts relatedFaq">' +
    '<div class="headline"><i class="fas fa-question-circle fa-fw"></i><span>相关问答</span></div>' +
    '<div class="relatedFaq-list">' + faqItemsHtml + '</div>' +
    '</div>';

  // Inject after the existing relatedPosts section
  // relatedPosts closes with </div>\n</div> before <hr> or comments
  var relatedEnd = '<\/div>\n<\/div>\n<hr class="custom-hr">';
  if (html.match(relatedEnd)) {
    html = html.replace(relatedEnd, '</div>\n</div>\n' + faqSection + '\n<hr class="custom-hr">');
  } else {
    // Fallback: inject before comments
    var commentMarker = '<div id="post-comment">';
    if (html.indexOf(commentMarker) !== -1) {
      html = html.replace(commentMarker, faqSection + '\n<hr class="custom-hr">\n' + commentMarker);
    }
  }

  return html;
});
