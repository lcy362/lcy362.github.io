/**
 * geo-schema.js
 * Dynamically generates FAQ / HowTo JSON-LD structured data + TL;DR injection.
 * 
 * Front-matter fields:
 *   faq:                          # FAQPage schema
 *     - q: "问题文本"             # answer auto-extracted from ### Q: heading
 *   howto:                        # HowTo schema  
 *     - name: "步骤名称"          # text auto-extracted from ## Step N: heading
 *   tldr: "一句话总结"            # Injected as highlighted block at top of article
 * 
 * Works alongside existing structured-data.js (BreadcrumbList + BlogPosting).
 */
hexo.extend.filter.register('after_render:html', function(html, data) {
  try {
  var path = data.path || '';
  var page = data.page || {};

  // Only process article pages
  if (!/^posts\/[\w-]+\/index\.html$/.test(path)) {
    return html;
  }

  var config = this.config;
  var faqData = page.faq;
  var howtoData = page.howto;
  var tldrText = page.tldr;
  var schemas = [];

  // ==== FAQ Schema ====
  if (faqData && Array.isArray(faqData) && faqData.length > 0) {
    var mainEntities = [];

    for (var i = 0; i < faqData.length; i++) {
      var item = faqData[i];
      var question = typeof item === 'string' ? item : (item.q || item.Q || '');
      var answer = item.a || '';

      // Auto-extract answer from rendered HTML
      if (!answer) {
        var escapedQ = question.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var qRegex = new RegExp(
          '<h3[^>]*>[^<]*<a[^>]*>[^<]*</a>\\s*Q:\\s*' + escapedQ + '[^<]*</h3>' +
          '\\s*([\\s\\S]*?)' +
          '(?=<h3[^>]*>\\s*Q:|</div>)', 'i'
        );
        var match = html.match(qRegex);
        if (match && match[1]) {
          answer = match[1]
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 500);
        }
        if (!answer) {
          answer = question;
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

  // ==== HowTo Schema ====
  if (howtoData && Array.isArray(howtoData) && howtoData.length > 0) {
    var steps = [];
    for (var i = 0; i < howtoData.length; i++) {
      var step = howtoData[i];
      var stepName = step.name || '';
      var stepText = step.text || '';

      // Auto-extract step text from rendered HTML if not provided
      if (!stepText) {
        var escapedName = stepName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var stepRegex = new RegExp(
          '<h[23][^>]*>\\s*Step\\s*' + (i + 1) + '[:\\s]\\s*' + escapedName + '[\\s\\S]*?' +
          '(?=<h[23][^>]*>\\s*Step\\s*' + (i + 2) + '[:\\s]|<h2[^>]*>|</div>)', 'i'
        );
        var stepMatch = html.match(stepRegex);
        if (stepMatch && stepMatch[0]) {
          stepText = stepMatch[0]
            .replace(/<h[23][^>]*>[\s\S]*?<\/h[23]>/g, '')
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 300);
        }
        if (!stepText) {
          stepText = stepName;
        }
      }

      steps.push({
        '@type': 'HowToStep',
        'position': i + 1,
        'name': stepName,
        'text': stepText
      });
    }

    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      'name': page.title || '',
      'step': steps
    });
  }

  // ==== TL;DR Injection ====
  if (tldrText) {
    var tldrBlock = 
      '<blockquote class="tldr-block" style="background:var(--theme-color,#0d9488)10;border-left:3px solid var(--theme-color,#0d9488);padding:1rem 1.2rem;margin-bottom:1.5rem;border-radius:0 6px 6px 0">' +
      '<strong style="color:var(--theme-color,#0d9488)">TL;DR</strong> ' + tldrText +
      '</blockquote>';
    
    // Inject after the first <p> in article content (after h1 title)
    html = html.replace(
      /(<article[^>]*class="[^"]*post-content[^"]*"[^>]*>)/,
      '$1' + tldrBlock
    );

    // Inject abstract into BlogPosting JSON-LD for AI/Geo visibility
    // BlogPosting structure: headline → url → image → datePublished → ...
    html = html.replace(
      /("image":\s*"[^"]*",)\s*\n\s*("datePublished")/,
      '$1\n  "abstract": ' + JSON.stringify(tldrText) + ',\n  $2'
    );
  }

  // ==== Inject JSON-LD ====
  if (schemas.length > 0) {
    var scripts = '';
    for (var s = 0; s < schemas.length; s++) {
      scripts += '<script type="application/ld+json">' + 
                 JSON.stringify(schemas[s]) + '</script>\n';
    }
    html = html.replace('</head>', scripts + '</head>');
  }

  return html;
  } catch(e) {
    console.error('[geo-schema] Error processing ' + (data.path || 'unknown') + ':', e.message);
    return html;
  }
});
