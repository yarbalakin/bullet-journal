// IndexedDB wrapper for Bullet Journal
let DB_NAME = 'bujo'; // будет переименован в 'bujo-{user_id}' после авторизации
const DB_VERSION = 6;

let db = null;
let _openingPromise = null; // защита от race condition

// Вызвать после получения user_id из Supabase Auth
function initUserDb(userId) {
  DB_NAME = 'bujo-' + userId;
  db = null;
  _openingPromise = null;
}

function openDB() {
  if (db) return Promise.resolve(db);
  if (_openingPromise) return _openingPromise;
  _openingPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = e => {
      const d = e.target.result;

      // Months — cover info per month
      if (!d.objectStoreNames.contains('months')) {
        d.createObjectStore('months', { keyPath: 'id' }); // id = "2026-03"
      }

      // Tasks
      if (!d.objectStoreNames.contains('tasks')) {
        const s = d.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
        s.createIndex('monthId', 'monthId');
        s.createIndex('date', 'date');
      }

      // Events
      if (!d.objectStoreNames.contains('events')) {
        const s = d.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
        s.createIndex('date', 'date');
      }

      // Moods
      if (!d.objectStoreNames.contains('moods')) {
        d.createObjectStore('moods', { keyPath: 'date' }); // date = "2026-03-05"
      }

      // Cosmetics
      if (!d.objectStoreNames.contains('cosmetics')) {
        const s = d.createObjectStore('cosmetics', { keyPath: 'id', autoIncrement: true });
        s.createIndex('expireDate', 'expireDate');
      }

      // Streak
      if (!d.objectStoreNames.contains('streak')) {
        d.createObjectStore('streak', { keyPath: 'id' }); // single record, id = "main"
      }

      // v2: Future Log
      if (!d.objectStoreNames.contains('futurelog')) {
        d.createObjectStore('futurelog', { keyPath: 'id' }); // id = "2026-04"
      }

      // v3: Collections
      if (!d.objectStoreNames.contains('collections')) {
        d.createObjectStore('collections', { keyPath: 'id' }); // id = "books" | "wishlist" | "gifts" | "braindump"
      }

      // v4: Habits + Day Notes
      if (!d.objectStoreNames.contains('habits')) {
        d.createObjectStore('habits', { keyPath: 'id' }); // id = "meta" | "YYYY-MM"
      }
      if (!d.objectStoreNames.contains('daynotes')) {
        d.createObjectStore('daynotes', { keyPath: 'date' }); // date = "YYYY-MM-DD"
      }

      // v5: Stickers (placed on pages)
      if (!d.objectStoreNames.contains('stickers')) {
        const s = d.createObjectStore('stickers', { keyPath: 'id', autoIncrement: true });
        s.createIndex('pageKey', 'pageKey');
      }

      // v6: Life Wheel (monthly life area ratings)
      if (!d.objectStoreNames.contains('lifewheel')) {
        d.createObjectStore('lifewheel', { keyPath: 'id' }); // id = "2026-03"
      }
    };

    req.onsuccess = e => { db = e.target.result; _openingPromise = null; resolve(db); };
    req.onerror = e => { _openingPromise = null; reject(e.target.error); };
  });
  return _openingPromise;
}

// Generic CRUD helpers
async function dbPut(store, data) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(store, 'readwrite');
    tx.objectStore(store).put(data);
    tx.oncomplete = () => resolve();
    tx.onerror = e => reject(e.target.error);
  });
}

async function dbGet(store, key) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const req = d.transaction(store).objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = e => reject(e.target.error);
  });
}

async function dbGetAll(store) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const req = d.transaction(store).objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = e => reject(e.target.error);
  });
}

async function dbGetByIndex(store, indexName, value) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const req = d.transaction(store).objectStore(store).index(indexName).getAll(value);
    req.onsuccess = () => resolve(req.result);
    req.onerror = e => reject(e.target.error);
  });
}

async function dbDelete(store, key) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(store, 'readwrite');
    tx.objectStore(store).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = e => reject(e.target.error);
  });
}

// Export all data as JSON (backup)
async function exportData() {
  const data = await getAllData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bujo-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Cloud Sync via Supabase ──
const STORES = ['months', 'tasks', 'events', 'moods', 'cosmetics', 'streak', 'futurelog', 'collections', 'habits', 'daynotes', 'stickers', 'lifewheel'];

async function getAllData() {
  const data = {};
  for (const name of STORES) {
    data[name] = await dbGetAll(name);
  }
  return data;
}

let syncTimer = null;
function scheduleSyncToCloud() {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => syncToCloud(), 3000);
}

function showToast(msg, isError) {
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);padding:8px 18px;border-radius:20px;font-size:13px;z-index:9999;color:#fff;background:${isError ? '#c05050' : '#6a9a6a'};opacity:0;transition:opacity .3s`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.style.opacity = '1');
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 2500);
}

async function getSupabaseHeaders() {
  const { data: { session } } = await getSupabase().auth.getSession();
  if (!session) throw new Error('Нет активной сессии');
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${session.access_token}`,
    'Prefer': 'resolution=merge-duplicates',
  };
}

async function syncToCloud() {
  try {
    const user = getCurrentUser();
    if (!user) return;
    const data = await getAllData();
    const headers = await getSupabaseHeaders();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/snapshots`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ user_id: user.id, data, updated_at: new Date().toISOString() }),
    });
    if (res.ok) {
      showToast('Сохранено в облако');
    } else {
      throw new Error(await res.text());
    }
  } catch (e) {
    showToast('Ошибка синхронизации', true);
    console.error('Sync error:', e);
  }
}

async function restoreFromCloud() {
  try {
    const user = getCurrentUser();
    if (!user) return;
    const headers = await getSupabaseHeaders();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/snapshots?user_id=eq.${user.id}&select=data,updated_at`, {
      headers,
    });
    const rows = await res.json();
    if (!rows.length || !rows[0].data) {
      alert('Нет данных в облаке');
      return;
    }
    const { data, updated_at } = rows[0];
    const d = await openDB();
    for (const storeName of STORES) {
      const items = data[storeName] || [];
      const tx = d.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).clear();
      for (const item of items) {
        tx.objectStore(storeName).put(item);
      }
      await new Promise((ok, fail) => { tx.oncomplete = ok; tx.onerror = fail; });
    }
    alert('Данные восстановлены из облака (' + updated_at?.slice(0, 10) + ')');
    navigate('home');
  } catch (e) {
    alert('Ошибка восстановления: ' + e.message);
  }
}

// Auto-sync: patch dbPut and dbDelete to trigger cloud sync
const _origDbPut = dbPut;
dbPut = async function(store, data) {
  await _origDbPut(store, data);
  scheduleSyncToCloud();
};

const _origDbDelete = dbDelete;
dbDelete = async function(store, key) {
  await _origDbDelete(store, key);
  scheduleSyncToCloud();
};
