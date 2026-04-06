// Auth module — Supabase Auth
// Зависит от: supabase-config.js (должен быть подключён раньше)

let _supabase = null;
let _currentUser = null;

function getSupabase() {
  if (!_supabase) {
    _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _supabase;
}

// Вернуть текущего пользователя или null
async function getUser() {
  const { data: { session } } = await getSupabase().auth.getSession();
  if (session) {
    _currentUser = session.user;
    return session.user;
  }
  return null;
}

function getCurrentUser() {
  return _currentUser;
}

// Вход через Google OAuth
async function signInWithGoogle() {
  const { error } = await getSupabase().auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + window.location.pathname
    }
  });
  if (error) showToast('Ошибка входа: ' + error.message, true);
}

// Вход по email + пароль
async function signInWithPassword(email, password) {
  const { error } = await getSupabase().auth.signInWithPassword({ email, password });
  if (error) {
    showToast('Ошибка: ' + error.message, true);
    return false;
  }
  location.reload();
  return true;
}

// Регистрация по email + пароль
async function signUpWithPassword(email, password) {
  const { data, error } = await getSupabase().auth.signUp({ email, password });
  if (error) {
    showToast('Ошибка: ' + error.message, true);
    return false;
  }
  // Если подтверждение email включено в Supabase — показываем подсказку
  if (data.user && !data.session) {
    document.getElementById('auth-hint').textContent = 'Проверь почту — нужно подтвердить регистрацию.';
    document.getElementById('auth-hint').style.display = 'block';
    return false;
  }
  location.reload();
  return true;
}

// Вход через magic link на email
async function signInWithEmail(email) {
  const { error } = await getSupabase().auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin + window.location.pathname
    }
  });
  if (error) {
    showToast('Ошибка: ' + error.message, true);
    return false;
  }
  return true;
}

// Выход
async function signOut() {
  await getSupabase().auth.signOut();
  _currentUser = null;
  location.reload();
}

// Показать экран логина
function showLoginScreen() {
  document.querySelector('.tab-bar').style.display = 'none';
  document.getElementById('content').innerHTML = `
    <div class="login-screen">
      <div class="login-card">
        <div class="login-logo">🌿</div>
        <h1 class="login-title">Bullet Journal</h1>
        <p class="login-subtitle">Твой личный дневник</p>

        <button class="btn-google" onclick="signInWithGoogle()">
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Войти через Google
        </button>

        <div class="login-divider"><span>или</span></div>

        <div id="login-form-password" class="login-email-form">
          <input type="email" id="login-email" placeholder="твой@email.com" class="login-input" autocomplete="email">
          <input type="password" id="login-password" placeholder="пароль" class="login-input" autocomplete="current-password">
          <button class="btn-magic" id="btn-submit" onclick="handlePasswordAuth()">Войти</button>
          <p class="login-toggle">
            <span id="toggle-hint">Нет аккаунта?</span>
            <a href="#" class="login-link" onclick="toggleAuthMode(event)">Зарегистрироваться</a>
          </p>
          <p class="login-toggle">
            <a href="#" class="login-link" onclick="showMagicLinkForm(event)">Войти по ссылке на почту</a>
          </p>
        </div>

        <div id="login-form-magic" class="login-email-form" style="display:none">
          <input type="email" id="magic-email" placeholder="твой@email.com" class="login-input" autocomplete="email">
          <button class="btn-magic" id="btn-magic" onclick="handleMagicLink()">Получить ссылку</button>
          <p class="login-toggle">
            <a href="#" class="login-link" onclick="showPasswordForm(event)">Войти с паролем</a>
          </p>
        </div>

        <p class="login-hint" id="auth-hint" style="display:none"></p>
      </div>
    </div>
  `;
}

let _authMode = 'signin'; // 'signin' | 'signup'

function toggleAuthMode(e) {
  e.preventDefault();
  _authMode = _authMode === 'signin' ? 'signup' : 'signin';
  const isSignup = _authMode === 'signup';
  document.getElementById('btn-submit').textContent = isSignup ? 'Создать аккаунт' : 'Войти';
  document.getElementById('toggle-hint').textContent = isSignup ? 'Уже есть аккаунт?' : 'Нет аккаунта?';
  document.querySelector('[onclick="toggleAuthMode(event)"]').textContent = isSignup ? 'Войти' : 'Зарегистрироваться';
  document.getElementById('login-password').autocomplete = isSignup ? 'new-password' : 'current-password';
  document.getElementById('auth-hint').style.display = 'none';
}

function showMagicLinkForm(e) {
  e.preventDefault();
  document.getElementById('login-form-password').style.display = 'none';
  document.getElementById('login-form-magic').style.display = 'flex';
  document.getElementById('auth-hint').style.display = 'none';
}

function showPasswordForm(e) {
  e.preventDefault();
  document.getElementById('login-form-magic').style.display = 'none';
  document.getElementById('login-form-password').style.display = 'flex';
  document.getElementById('auth-hint').style.display = 'none';
}

async function handlePasswordAuth() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  if (!email || !password) return;

  const btn = document.getElementById('btn-submit');
  btn.disabled = true;
  btn.textContent = '...';

  const ok = _authMode === 'signup'
    ? await signUpWithPassword(email, password)
    : await signInWithPassword(email, password);

  if (!ok) {
    btn.disabled = false;
    btn.textContent = _authMode === 'signup' ? 'Создать аккаунт' : 'Войти';
  }
}

async function handleMagicLink() {
  const email = document.getElementById('magic-email').value.trim();
  if (!email) return;
  const btn = document.getElementById('btn-magic');
  btn.disabled = true;
  btn.textContent = 'Отправляем...';
  const ok = await signInWithEmail(email);
  if (ok) {
    document.getElementById('auth-hint').textContent = 'Проверь почту — там ссылка для входа.';
    document.getElementById('auth-hint').style.display = 'block';
    btn.textContent = 'Отправлено';
  } else {
    btn.disabled = false;
    btn.textContent = 'Получить ссылку';
  }
}
