// Simple SPA router
const routes = {};
let currentPage = null;

function route(path, handler) {
  routes[path] = handler;
}

function navigate(path, params = {}) {
  const content = document.getElementById('content');
  if (!content) return;

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
    if (result && typeof result.catch === 'function') {
      result.catch(e => {
        console.error('Page render error:', path, e);
        content.innerHTML = `<p style="padding:20px;color:#c05050;font-size:14px">Ошибка: ${e.message}</p>`;
      });
    }
    history.pushState({ path, params }, '', `#${path}`);
    // Render stickers overlay after page content
    if (typeof renderPageStickers === 'function') {
      setTimeout(renderPageStickers, 50);
    }
  }
}

// Handle back button
window.addEventListener('popstate', e => {
  if (e.state?.path) {
    navigate(e.state.path, e.state.params || {});
  }
});
