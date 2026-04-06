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

  // Show lock screen if PIN is set and session not active
  if (hasPin(user.id) && !isUnlocked(user.id)) {
    showLockScreen(user.id, () => {
      if (needsOnboarding(user.id)) {
        document.querySelector('.tab-bar').style.display = 'none';
        showOnboarding(user.id, () => {
          document.querySelector('.tab-bar').style.display = '';
          navigate('home');
        });
      } else {
        navigate(location.hash.slice(1) || 'home');
      }
    });
    return;
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

const _isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
const _isInStandaloneMode = window.navigator.standalone === true;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _installEvent = e;
  setTimeout(showInstallBanner, 2000);
});

// iOS: no beforeinstallprompt — show manual hint instead
if (_isIos && !_isInStandaloneMode) {
  setTimeout(showInstallBanner, 2000);
}

function showInstallBanner() {
  if (localStorage.getItem('bujo-install-dismissed')) return;
  if (document.getElementById('install-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'install-banner';
  banner.className = 'install-banner';

  if (_isIos) {
    banner.innerHTML = `
      <div class="install-banner-ios">
        <span class="install-banner-close" id="install-dismiss">&times;</span>
        <p class="install-banner-ios-text">
          Нажми <strong>&#8679;</strong> внизу экрана, затем<br>
          <strong>«На экран Домой»</strong> — и приложение появится на рабочем столе
        </p>
        <div class="install-banner-ios-arrow"></div>
      </div>
    `;
  } else {
    if (!_installEvent) return;
    banner.innerHTML = `
      <span class="install-banner-text">Установи приложение на экран</span>
      <button class="install-banner-btn" id="install-btn">Установить</button>
      <button class="install-banner-close" id="install-dismiss">&times;</button>
    `;
  }

  document.body.appendChild(banner);

  document.getElementById('install-dismiss').addEventListener('click', () => {
    localStorage.setItem('bujo-install-dismissed', '1');
    banner.remove();
  });

  if (!_isIos) {
    document.getElementById('install-btn').addEventListener('click', async () => {
      _installEvent.prompt();
      const { outcome } = await _installEvent.userChoice;
      if (outcome === 'accepted') localStorage.setItem('bujo-install-dismissed', '1');
      banner.remove();
      _installEvent = null;
    });
  }
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
