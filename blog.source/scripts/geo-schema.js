/**
 * geo-schema.js
 * Dynamically generates FAQ / HowTo JSON-LD structured data.
 * 
 * Driven by front-matter:
 *   faq:                          # FAQPage schema
 *     - q: "问题文本"
 *     - q: "另一个问题"           # answer auto-extracted from body
 *   howto:                        # HowTo schema  
 *     - name: "步骤名称"
 *       text: "步骤描述"          # optional, auto-extracted if omitted
 * 
 * Works alongside existing structured-data.js (BreadcrumbList + BlogPosting).
 */
hexo.extend.filter.register('after_render:html', function(html, data) {
  var path = data.path || '';
  var page = data.page || {};

  // Only process article pages
  if (!/^posts\/[\w-]+\/index\.html$/.test(path)) {
    return html;
  }

  var config = this.config;
  var faqData = page.faq;
  var howtoData = page.howto;
  var schemas = [];

  // ---- FAQ Schema ----
  if (faqData && Array.isArray(faqData) && faqData.length > 0) {
    var mainEntities = [];

    for (var i = 0; i < faqData.length; i++) {
      var item = faqData[i];
      var question = typeof item === 'string' ? item : item.q;
      var answer = item.a || '';

      // Auto-extract answer from rendered HTML body if not provided in front-matter
      if (!answer) {
        var escapedQ = question.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Match: <h3...>Q: question</h3><p>answer text</p>
        // The rendered heading may have an <a> tag for the headerlink
        var qRegex = new RegExp(
          '<h3[^>]*>[^<]*<a[^>]*>[^<]*</a>\\s*Q:\\s*' + escapedQ + '[^<]*</h3>' +
          '\\s*([\\s\\S]*?)' +
          '(?=<h3[^>]*>\\s*Q:|</div>)', 'i'
        );
        var match = html.match(qRegex);
        if (match) {
          answer = match[1]
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 500);
        }
        if (!answer) {
          answer = question; // fallback
        }
      }

      mainEntities.push({
        '@type': 'Question',
        'name': question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': answer
        }
      });
    }

    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': mainEntities
    });
  }

  // ---- HowTo Schema ----
  if (howtoData && Array.isArray(howtoData) && howtoData.length > 0) {
    var steps = [];
    for (var i = 0; i < howtoData.length; i++) {
      var step = howtoData[i];
      steps.push({
        '@type': 'HowToStep',
        'position': i + 1,
        'name': step.name || '',
        'text': step.text || step.name || ''
      });
    }

    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      'name': page.title || '',
      'step': steps
    });
  }

  // ---- Inject JSON-LD ----
  if (schemas.length > 0) {
    var scripts = '';
    for (var s = 0; s < schemas.length; s++) {
      scripts += '<script type="application/ld+json">' + 
                 JSON.stringify(schemas[s]) + '</script>\n';
    }
    html = html.replace('</head>', scripts + '</head>');
  }

  return html;
});
