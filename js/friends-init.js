// 友情链接页初始化：等 friends.js 就绪后渲染卡片并绑定表单。
// 由页面 front-matter 的 inject.head 引入，顺序：friends.js -> friends-init.js。
(function () {
  function run() {
    if (!window.friends) return false;
    var grid = document.querySelector('[data-friends-featured]');
    var form = document.querySelector('[data-friends-form]');
    if (!grid && !form) return false;
    window.friends.renderFeatured(grid);
    window.friends.bindApplyForm(form);
    return true;
  }
  if (run()) return;
  // inject 只支持一个 head 项，所以 friends.js 用动态方式加载；加载完立刻初始化。
  var s = document.createElement('script');
  s.src = '/js/friends.js';
  s.onload = run;
  document.head.appendChild(s);
})();
