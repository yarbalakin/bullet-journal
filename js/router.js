// Simple SPA router
const routes = {};
let currentPage = null;
const scrollPositions = {};

function route(path, handler) {
  routes[path] = handler;
}

function navigate(path, params = {}) {
  const content = document.getElementById('content');
  if (!content) return;

  // Save scroll position of current page before leaving
  if (currentPage) {
    scrollPositions[currentPage] = window.scrollY;
  }

  // Update active tab
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.page === path);
  });

  // Run page handler
  const handler = routes[path];
  if (handler) {
    currentPage = path;
    content.innerHTML = '';
    const result = handler(content, params);
    const finish = () => {
      // Restore scroll: use saved position only if no explicit params (i.e. returning, not fresh nav)
      const saved = scrollPositions[path];
      const isFreshNav = Object.keys(params).length > 0;
      if (saved !== undefined && !isFreshNav) {
        requestAnimationFrame(() => window.scrollTo(0, saved));
      } else {
        window.scrollTo(0, 0);
      }
      // Render stickers overlay after page content
      if (typeof renderPageStickers === 'function') {
        setTimeout(renderPageStickers, 50);
      }
    };
    if (result && typeof result.then === 'function') {
      result.then(finish).catch(e => {
        console.error('Page render error:', path, e);
        content.innerHTML = `<p style="padding:20px;color:#c05050;font-size:14px">Ошибка: ${e.message}</p>`;
      });
    } else {
      finish();
    }
    history.pushState({ path, params }, '', `#${path}`);
  }
}

// Handle back button
window.addEventListener('popstate', e => {
  if (e.state?.path) {
    navigate(e.state.path, e.state.params || {});
  }
});
