// Lock screen — PIN + WebAuthn biometrics

const _pinKey   = uid => `bujo-pin-${uid}`;
const _credKey  = uid => `bujo-cred-${uid}`;
const _sessKey  = uid => `bujo-sess-${uid}`;

// ── Helpers ──

function hasPin(uid) {
  return !!localStorage.getItem(_pinKey(uid));
}

function isUnlocked(uid) {
  return !!sessionStorage.getItem(_sessKey(uid));
}

function markUnlocked(uid) {
  sessionStorage.setItem(_sessKey(uid), '1');
}

async function hashPin(pin) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function savePin(uid, pin) {
  localStorage.setItem(_pinKey(uid), await hashPin(pin));
}

async function checkPin(uid, pin) {
  return localStorage.getItem(_pinKey(uid)) === await hashPin(pin);
}

function hasBiometric(uid) {
  return !!localStorage.getItem(_credKey(uid));
}

// ── WebAuthn ──

async function registerBiometric(uid) {
  if (!window.PublicKeyCredential) return false;
  try {
    const cred = await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: 'Bullet Journal', id: location.hostname },
        user: {
          id: new TextEncoder().encode(uid.slice(0, 64)),
          name: 'bujo',
          displayName: 'BuJo',
        },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
        timeout: 60000,
      },
    });
    // Store raw credential id as hex
    const idHex = Array.from(new Uint8Array(cred.rawId)).map(b => b.toString(16).padStart(2,'0')).join('');
    localStorage.setItem(_credKey(uid), idHex);
    return true;
  } catch (e) {
    console.warn('WebAuthn register error:', e);
    return false;
  }
}

async function authenticateBiometric(uid) {
  const idHex = localStorage.getItem(_credKey(uid));
  if (!idHex) return false;
  try {
    const idBytes = new Uint8Array(idHex.match(/../g).map(h => parseInt(h, 16)));
    await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [{ id: idBytes, type: 'public-key' }],
        userVerification: 'required',
        timeout: 60000,
      },
    });
    return true;
  } catch (e) {
    console.warn('WebAuthn auth error:', e);
    return false;
  }
}

// ── PIN numpad UI ──

function buildNumpad(onDigit, onBack) {
  const keys = [1,2,3,4,5,6,7,8,9,null,0,'back'];
  return keys.map(k => {
    if (k === null) return `<div></div>`;
    if (k === 'back') return `<button class="pin-key pin-back" id="pin-key-back">&#9003;</button>`;
    return `<button class="pin-key" data-digit="${k}">${k}</button>`;
  }).join('');
}

function attachNumpad(container, onDigit, onBack) {
  container.querySelectorAll('.pin-key[data-digit]').forEach(btn => {
    btn.addEventListener('click', () => onDigit(btn.dataset.digit));
  });
  const backBtn = container.querySelector('#pin-key-back');
  if (backBtn) backBtn.addEventListener('click', onBack);
}

function renderDots(count, filled) {
  return Array.from({length: count}, (_, i) =>
    `<span class="pin-dot ${i < filled ? 'filled' : ''}"></span>`
  ).join('');
}

// ── PIN Setup ──

function showPinSetup(uid, onDone) {
  const overlay = document.createElement('div');
  overlay.className = 'lock-overlay';
  document.body.appendChild(overlay);

  let step = 1; // 1 = first entry, 2 = confirm
  let first = '';
  let current = '';

  function render() {
    overlay.innerHTML = `
      <div class="lock-card">
        <h2 class="lock-title">${step === 1 ? 'Придумай пин-код' : 'Повтори пин-код'}</h2>
        <p class="lock-sub">${step === 1 ? '4 цифры' : 'для подтверждения'}</p>
        <div class="pin-dots" id="pin-dots">${renderDots(4, current.length)}</div>
        <div class="pin-grid">${buildNumpad()}</div>
        <button class="lock-skip" id="lock-skip">Пропустить</button>
      </div>
    `;
    attachNumpad(overlay, onDigit, onBack);
    overlay.querySelector('#lock-skip').addEventListener('click', () => {
      overlay.remove();
      onDone(false);
    });
  }

  function onDigit(d) {
    if (current.length >= 4) return;
    current += d;
    overlay.querySelector('#pin-dots').innerHTML = renderDots(4, current.length);
    if (current.length === 4) {
      setTimeout(async () => {
        if (step === 1) {
          first = current;
          current = '';
          step = 2;
          render();
        } else {
          if (current === first) {
            await savePin(uid, current);
            overlay.remove();
            onDone(true);
          } else {
            current = '';
            first = '';
            step = 1;
            showToast('Пин-коды не совпали', true);
            render();
          }
        }
      }, 150);
    }
  }

  function onBack() {
    current = current.slice(0, -1);
    overlay.querySelector('#pin-dots').innerHTML = renderDots(4, current.length);
  }

  render();
}

// ── Lock Screen ──

function showLockScreen(uid, onUnlock) {
  document.querySelector('.tab-bar').style.display = 'none';
  document.getElementById('content').innerHTML = '';

  const overlay = document.createElement('div');
  overlay.className = 'lock-overlay';
  document.body.appendChild(overlay);

  const canBio = hasBiometric(uid);

  let current = '';

  function render() {
    overlay.innerHTML = `
      <div class="lock-card">
        <div class="lock-logo">&#127807;</div>
        <h2 class="lock-title">Bullet Journal</h2>
        <div class="pin-dots" id="pin-dots">${renderDots(4, 0)}</div>
        <div class="pin-grid">${buildNumpad()}</div>
        ${canBio ? `<button class="lock-bio-btn" id="lock-bio">&#9651; Отпечаток пальца</button>` : ''}
        <button class="lock-skip" id="lock-signout">Выйти из аккаунта</button>
      </div>
    `;
    attachNumpad(overlay, onDigit, onBack);
    if (canBio) {
      overlay.querySelector('#lock-bio').addEventListener('click', tryBiometric);
    }
    overlay.querySelector('#lock-signout').addEventListener('click', () => {
      overlay.remove();
      signOut();
    });
  }

  async function onDigit(d) {
    if (current.length >= 4) return;
    current += d;
    overlay.querySelector('#pin-dots').innerHTML = renderDots(4, current.length);
    if (current.length === 4) {
      setTimeout(async () => {
        const ok = await checkPin(uid, current);
        if (ok) {
          unlock();
        } else {
          current = '';
          overlay.querySelector('#pin-dots').innerHTML = renderDots(4, 0);
          showToast('Неверный пин', true);
        }
      }, 150);
    }
  }

  function onBack() {
    current = current.slice(0, -1);
    overlay.querySelector('#pin-dots').innerHTML = renderDots(4, current.length);
  }

  async function tryBiometric() {
    const ok = await authenticateBiometric(uid);
    if (ok) unlock();
    else showToast('Не удалось подтвердить', true);
  }

  function unlock() {
    markUnlocked(uid);
    overlay.remove();
    document.querySelector('.tab-bar').style.display = '';
    onUnlock();
  }

  render();

  // Auto-trigger biometric on open if registered
  if (canBio) setTimeout(tryBiometric, 400);
}

// ── Public: offer to set up PIN after first unlock ──
// Called from home page "Защита" button

async function openLockSettings(uid) {
  if (!hasPin(uid)) {
    showPinSetup(uid, async (pinSet) => {
      if (pinSet && window.PublicKeyCredential) {
        // Offer biometric
        const overlay = document.createElement('div');
        overlay.className = 'lock-overlay';
        overlay.innerHTML = `
          <div class="lock-card">
            <div class="lock-logo" style="font-size:36px">&#9651;</div>
            <h2 class="lock-title">Включить отпечаток?</h2>
            <p class="lock-sub">Для быстрой разблокировки</p>
            <button class="onboarding-btn" id="bio-yes" style="margin-top:24px">Включить</button>
            <button class="lock-skip" id="bio-no">Пропустить</button>
          </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('#bio-yes').addEventListener('click', async () => {
          const ok = await registerBiometric(uid);
          overlay.remove();
          showToast(ok ? 'Отпечаток подключён' : 'Не удалось подключить');
        });
        overlay.querySelector('#bio-no').addEventListener('click', () => overlay.remove());
      }
      if (pinSet) showToast('Пин-код установлен');
    });
  } else {
    // Already has PIN — offer to reset or add biometric
    const overlay = document.createElement('div');
    overlay.className = 'lock-overlay';
    overlay.innerHTML = `
      <div class="lock-card">
        <h2 class="lock-title">Защита</h2>
        <button class="onboarding-btn" id="lock-reset" style="margin-top:24px">Сменить пин-код</button>
        ${!hasBiometric(uid) && window.PublicKeyCredential ? `<button class="onboarding-btn" id="lock-bio" style="margin-top:12px;background:#a8c8a0">Подключить отпечаток</button>` : ''}
        <button class="lock-skip" id="lock-off" style="color:#c05050">Отключить защиту</button>
        <button class="lock-skip" id="lock-close">Закрыть</button>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#lock-reset').addEventListener('click', () => {
      overlay.remove();
      localStorage.removeItem(_pinKey(uid));
      openLockSettings(uid);
    });
    const biobtn = overlay.querySelector('#lock-bio');
    if (biobtn) biobtn.addEventListener('click', async () => {
      const ok = await registerBiometric(uid);
      overlay.remove();
      showToast(ok ? 'Отпечаток подключён' : 'Не удалось подключить');
    });
    overlay.querySelector('#lock-off').addEventListener('click', () => {
      localStorage.removeItem(_pinKey(uid));
      localStorage.removeItem(_credKey(uid));
      overlay.remove();
      showToast('Защита отключена');
    });
    overlay.querySelector('#lock-close').addEventListener('click', () => overlay.remove());
  }
}
