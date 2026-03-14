// Main app — init PWA, register routes, start
async function init() {
  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  // Open DB
  await openDB();

  // Set up tab navigation
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => navigate(tab.dataset.page));
  });

  // Init sticker system
  if (typeof initStickers === 'function') {
    await initStickers();
  }

  // Navigate to initial page
  const hash = location.hash.slice(1) || 'home';
  navigate(hash);
}

document.addEventListener('DOMContentLoaded', init);
