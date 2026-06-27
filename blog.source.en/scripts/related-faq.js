/**
 * related-faq.js
 * Injects a "Related Q&A" and/or "Related How-To" section after the existing relatedPosts widget.
 * 
 * FAQ matching logic:
 * 1. Same category → +3 weight
 * 2. Shared tags → +1 weight per shared tag
 * 3. Only includes articles that have front-matter `faq:` defined
 * 
 * HowTo matching logic:
 * 1. Same category → +3 weight
 * 2. Shared tags → +2 weight per shared tag
 * 3. Only includes articles that have front-matter `howto:` defined
 * 
 * Note: HowTo recommendations use a separate section with its own headline.
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

  // ==== Collect FAQ candidates ====
  var faqCandidates = [];
  var howtoCandidates = [];

  site.forEach(function(post) {
    if (post._id === page._id) return;

    // FAQ candidates
    if (post.faq && Array.isArray(post.faq) && post.faq.length > 0) {
      var fWeight = 0;
      if (post.categories && post.categories.data) {
        for (var i = 0; i < post.categories.data.length; i++) {
          if (currentCategories.indexOf(post.categories.data[i].name) !== -1) {
            fWeight += 3;
          }
        }
      }
      if (post.tags && post.tags.data) {
        for (var i = 0; i < post.tags.data.length; i++) {
          if (currentTags.indexOf(post.tags.data[i].name) !== -1) {
            fWeight += 1;
          }
        }
      }
      if (fWeight > 0) {
        faqCandidates.push({
          title: post.title,
          path: post.path,
          faq: post.faq.slice(0, 3),
          weight: fWeight,
          date: post.date
        });
      }
    }

    // HowTo candidates
    if (post.howto && Array.isArray(post.howto) && post.howto.length > 0) {
      var hWeight = 0;
      if (post.categories && post.categories.data) {
        for (var i = 0; i < post.categories.data.length; i++) {
          if (currentCategories.indexOf(post.categories.data[i].name) !== -1) {
            hWeight += 3;
          }
        }
      }
      if (post.tags && post.tags.data) {
        for (var i = 0; i < post.tags.data.length; i++) {
          if (currentTags.indexOf(post.tags.data[i].name) !== -1) {
            hWeight += 2;
          }
        }
      }
      if (hWeight > 0) {
        howtoCandidates.push({
          title: post.title,
          path: post.path,
          howto: post.howto,
          weight: hWeight,
          date: post.date
        });
      }
    }
  });

  var config = this.config;
  var baseUrl = config.url;
  var injection = '';

  // ==== Build Related FAQ section ====
  faqCandidates.sort(function(a, b) {
    if (b.weight !== a.weight) return b.weight - a.weight;
    return b.date - a.date;
  });
  faqCandidates = faqCandidates.slice(0, 4);

  if (faqCandidates.length > 0) {
    var faqItemsHtml = '';
    for (var c = 0; c < faqCandidates.length; c++) {
      var candidate = faqCandidates[c];
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

    injection += 
      '<div class="relatedPosts relatedFaq">' +
      '<div class="headline"><i class="fas fa-question-circle fa-fw"></i><span>相关问答</span></div>' +
      '<div class="relatedFaq-list">' + faqItemsHtml + '</div>' +
      '</div>';
  }

  // ==== Build Related HowTo section ====
  howtoCandidates.sort(function(a, b) {
    if (b.weight !== a.weight) return b.weight - a.weight;
    return b.date - a.date;
  });
  howtoCandidates = howtoCandidates.slice(0, 3);

  if (howtoCandidates.length > 0) {
    var howtoItemsHtml = '';
    for (var h = 0; h < howtoCandidates.length; h++) {
      var hc = howtoCandidates[h];
      var steps = hc.howto.slice(0, 4);
      var howtoLink = baseUrl + '/' + hc.path;

      howtoItemsHtml += '<div class="relatedHowto-item">' +
        '<a class="relatedHowto-title" href="' + howtoLink + '">' + hc.title + '</a>' +
        '<ol class="relatedHowto-steps">';

      for (var s = 0; s < steps.length; s++) {
        var stepName = typeof steps[s] === 'string' ? steps[s] : steps[s].name;
        howtoItemsHtml += '<li>' + stepName + '</li>';
      }

      howtoItemsHtml += '</ol></div>';
    }

    injection += 
      '<div class="relatedPosts relatedHowto">' +
      '<div class="headline"><i class="fas fa-list-ol fa-fw"></i><span>相关教程</span></div>' +
      '<div class="relatedHowto-list">' + howtoItemsHtml + '</div>' +
      '</div>';
  }

  // ==== Inject ====
  if (injection) {
    var relatedEnd = '<\/div>\n<\/div>\n<hr class="custom-hr">';
    if (html.match(relatedEnd)) {
      html = html.replace(relatedEnd, '</div>\n</div>\n' + injection + '\n<hr class="custom-hr">');
    } else {
      var commentMarker = '<div id="post-comment">';
      if (html.indexOf(commentMarker) !== -1) {
        html = html.replace(commentMarker, injection + '\n<hr class="custom-hr">\n' + commentMarker);
      }
    }
  }

  return html;
});
