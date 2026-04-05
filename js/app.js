// Main app — init PWA, register routes, start
async function init() {
  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  // Check auth — если не залогинен, показать экран входа и остановиться
  const user = await getUser();
  if (!user) {
    showLoginScreen();
    return;
  }

  // Namespace IndexedDB по user_id — у каждого свои данные
  initUserDb(user.id);

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

async function updateApp() {
  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) {
      await reg.update();
      // If a new SW is waiting — activate it immediately
      if (reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    }
  }
  location.reload(true);
}
