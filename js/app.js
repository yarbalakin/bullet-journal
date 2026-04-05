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

  // One-time migration: pull data from n8n if Supabase snapshot is empty
  await migrateFromN8nIfNeeded();

  // Set up tab navigation
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => navigate(tab.dataset.page));
  });

  // Init sticker system
  if (typeof initStickers === 'function') {
    await initStickers();
  }

  // Show onboarding on first login, then navigate
  if (needsOnboarding(user.id)) {
    document.querySelector('.tab-bar').style.display = 'none';
    showOnboarding(user.id, () => {
      document.querySelector('.tab-bar').style.display = '';
      navigate('home');
    });
  } else {
    const hash = location.hash.slice(1) || 'home';
    navigate(hash);
  }
}

document.addEventListener('DOMContentLoaded', init);

// PWA install prompt
let _installEvent = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _installEvent = e;
  // Show banner after short delay so it doesn't fight with onboarding
  setTimeout(showInstallBanner, 2000);
});

function showInstallBanner() {
  if (!_installEvent || localStorage.getItem('bujo-install-dismissed')) return;
  if (document.getElementById('install-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'install-banner';
  banner.className = 'install-banner';
  banner.innerHTML = `
    <span class="install-banner-text">Установи приложение на экран</span>
    <button class="install-banner-btn" id="install-btn">Установить</button>
    <button class="install-banner-close" id="install-dismiss">&times;</button>
  `;
  document.body.appendChild(banner);

  document.getElementById('install-btn').addEventListener('click', async () => {
    _installEvent.prompt();
    const { outcome } = await _installEvent.userChoice;
    if (outcome === 'accepted') localStorage.setItem('bujo-install-dismissed', '1');
    banner.remove();
    _installEvent = null;
  });

  document.getElementById('install-dismiss').addEventListener('click', () => {
    localStorage.setItem('bujo-install-dismissed', '1');
    banner.remove();
  });
}

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
