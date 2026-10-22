/* 友情链接页与接力页共用的前端逻辑。零依赖，直接挂在 window.friends。 */
(function () {
  // 后端挂在 api 域名下；可用 window.FRIENDS_API 覆盖（本地开发时用）。
  var API = (window.FRIENDS_API || 'https://api.lichuanyang.top/api/friends').replace(/\/$/, '');

  function lang() {
    var l = (document.documentElement.lang || '').toLowerCase();
    return l.indexOf('en') === 0 ? 'en' : 'zh';
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /** 拉取精选池并渲染成卡片列表。root 是容器元素。 */
  function renderFeatured(root) {
    if (!root) return;
    var l = lang();
    root.setAttribute('aria-busy', 'true');
    fetch(API + '/featured?lang=' + l, { credentials: 'omit' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        root.textContent = '';
        var grid = el('div', 'friends-grid');
        (data.items || []).forEach(function (it) {
          var a = el('a', 'friends-card');
          a.href = it.url;
          a.target = '_blank';
          // 「推荐阅读」条目只加 nofollow，展示上与普通友链完全一致。
          a.rel = it.nofollow ? 'noopener nofollow' : 'noopener';
          a.appendChild(el('strong', 'friends-card__name', it.name));
          if (it.desc) a.appendChild(el('span', 'friends-card__desc', it.desc));
          grid.appendChild(a);
        });
        root.appendChild(grid);
      })
      .catch(function (e) {
        root.textContent = l === 'en'
          ? 'Failed to load the list. Please try again later.'
          : '列表加载失败，请稍后再试。';
        if (window.console) console.warn('[friends] featured failed:', e);
      })
      .finally(function () { root.removeAttribute('aria-busy'); });
  }

  /**
   * 拉取**全部**友链并按分类分组渲染。root 是容器元素。
   *
   * 与 renderFeatured 的区别：这是整页列表，包含自有站与所有已收录友链，
   * 按后端给的分类分组。
   */
  function renderAll(root) {
    if (!root) return;
    var l = lang();
    root.setAttribute('aria-busy', 'true');
    fetch(API + '/all?lang=' + l, { credentials: 'omit' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        root.textContent = '';
        (data.groups || []).forEach(function (g) {
          var sec = el('section', 'friends-group');
          sec.appendChild(el('h2', 'friends-group__title', g.label));
          var grid = el('div', 'friends-grid');
          (g.items || []).forEach(function (it) {
            var a = el('a', 'friends-card');
            a.href = it.url;
            a.target = '_blank';
            // 「推荐阅读」条目只加 nofollow，展示上与普通友链完全一致。
          a.rel = it.nofollow ? 'noopener nofollow' : 'noopener';
            a.appendChild(el('strong', 'friends-card__name', it.name));
            if (it.desc) a.appendChild(el('span', 'friends-card__desc', it.desc));
            grid.appendChild(a);
          });
          sec.appendChild(grid);
          root.appendChild(sec);
        });
        if (!data.count) {
          root.textContent = l === 'en' ? 'No links yet.' : '还没有友链。';
        }
      })
      .catch(function (e) {
        root.textContent = l === 'en'
          ? 'Failed to load the list. Please try again later.'
          : '列表加载失败，请稍后再试。';
        if (window.console) console.warn('[friends] all failed:', e);
      })
      .finally(function () { root.removeAttribute('aria-busy'); });
  }

  /**
   * 随机跃迁：打开**中转页**，由中转页展示跃迁状态，再跳到目标站。
   *
   * 2026-10-22 改：此前是开一个空白标签、拿到坐标后直接改它的 location，
   * 用户看到的是一片白；现在中转页自己拉坐标、跑状态动画、中英双语报进度，
   * 跳转也在它内部用 location.replace 完成（不污染历史）。
   * 浏览器会拦截「非用户手势触发的 window.open」，所以这里必须由点击事件同步调用。
   */
  function relay(from) {
    // 站内根路径：中文站 /，英文站 /en/。
    // 不能写相对路径 'relay/'——links 页在 /links/ 下，会拼成 /links/relay/。
    var root = /^\/en(\/|$)/.test(location.pathname) ? '/en/' : '/';
    var url = root + 'relay/?lang=' + lang() + (from ? '&from=' + encodeURIComponent(from) : '');
    var win = window.open(url, '_blank');
    if (!win) location.href = url; // 弹窗被拦时退化为当前页打开中转页
  }

  /** 申请表单提交。只做格式提示，最终判定在服务端审核。 */
  function bindApplyForm(form) {
    if (!form) return;
    var status = form.querySelector('[data-friends-status]');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var fd = new FormData(form);
      var payload = {
        name: (fd.get('name') || '').trim(),
        desc: (fd.get('desc') || '').trim(),
        url: (fd.get('url') || '').trim(),
        // 语言由页面自动判断，不再让提交者选。
        lang: lang() === 'en' ? 'en' : 'zh'
      };
      var say = function (msg, ok) {
        if (!status) return;
        status.textContent = msg;
        status.className = ok ? 'friends-status friends-status--ok' : 'friends-status friends-status--err';
      };
      var btn = form.querySelector('button[type=submit]');
      if (btn) btn.disabled = true;
      fetch(API + '/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json().then(function (b) { return { ok: r.ok, body: b }; }); })
        .then(function (res) {
          if (res.ok) {
            say(lang() === 'en' ? 'Submitted. It will be reviewed manually.' : '已提交，会人工审核。', true);
            form.reset();
          } else {
            say(res.body.error || '提交失败', false);
          }
        })
        .catch(function () { say(lang() === 'en' ? 'Network error.' : '网络错误，请稍后再试。', false); })
        .finally(function () { if (btn) btn.disabled = false; });
    });
  }

  window.friends = { API: API, lang: lang, renderFeatured: renderFeatured, renderAll: renderAll, relay: relay, bindApplyForm: bindApplyForm };
})();
