// ── Sticker System ──
// Floating button → bottom-sheet picker → place on page → drag/pinch/rotate/delete

const STICKER_CATS = {
  flowers: 'Цветы', cozy: 'Уютное', nature: 'Природа',
  deco: 'Декор', seasonal: 'Сезоны', food: 'Еда'
};

let stickerManifest = [];
let selectedSticker = null;

// ── INIT ──

async function initStickers() {
  try {
    const res = await fetch('images/stickers/manifest.json');
    stickerManifest = await res.json();
  } catch { stickerManifest = []; return; }

  if (!stickerManifest.length) return;

  // Floating button
  const fab = document.createElement('button');
  fab.className = 'sticker-fab';
  fab.innerHTML = '&#10047;';
  fab.addEventListener('click', togglePicker);
  document.body.appendChild(fab);

  // Build picker
  buildPicker();

  // Deselect when tapping empty area
  document.addEventListener('click', e => {
    if (!e.target.closest('.placed-sticker') && !e.target.closest('.sticker-controls') && !e.target.closest('.sticker-fab')) {
      deselectSticker();
    }
  });
}

// ── PICKER (bottom sheet) ──

function buildPicker() {
  const overlay = document.createElement('div');
  overlay.id = 'sticker-picker-overlay';
  overlay.className = 'sticker-picker-overlay hidden';

  const sheet = document.createElement('div');
  sheet.className = 'sticker-picker-sheet';

  const cats = Object.entries(STICKER_CATS);
  sheet.innerHTML = `
    <div class="picker-header">
      <span class="picker-title">Стикеры</span>
      <button class="picker-close" onclick="togglePicker()">&times;</button>
    </div>
    <div class="picker-tabs">
      ${cats.map(([k, v], i) => `<button class="picker-tab${i === 0 ? ' active' : ''}" data-cat="${k}" onclick="showStickerCat('${k}')">${v}</button>`).join('')}
    </div>
    <div class="picker-grid" id="picker-grid"></div>
  `;

  overlay.appendChild(sheet);
  overlay.addEventListener('click', e => { if (e.target === overlay) togglePicker(); });
  document.body.appendChild(overlay);

  showStickerCat(cats[0][0]);
}

function showStickerCat(cat) {
  document.querySelectorAll('.picker-tab').forEach(t => t.classList.toggle('active', t.dataset.cat === cat));
  const grid = document.getElementById('picker-grid');
  if (!grid) return;
  const items = stickerManifest.filter(s => s.category === cat);
  grid.innerHTML = items.map(s =>
    `<div class="picker-sticker" onclick="placeNewSticker('${s.id}')"><img src="images/stickers/${s.file}" alt="${s.id}" loading="lazy"></div>`
  ).join('');
}

function togglePicker() {
  document.getElementById('sticker-picker-overlay')?.classList.toggle('hidden');
}

// ── PLACE NEW STICKER ──

async function placeNewSticker(assetId) {
  const content = document.getElementById('content');
  const pageKey = location.hash.slice(1) || 'home';
  const cW = content.clientWidth;
  const scrollY = content.scrollTop || window.scrollY || 0;
  const viewH = window.innerHeight;

  await dbPut('stickers', {
    pageKey,
    assetId,
    x: Math.round(cW / 2 - 40),
    y: Math.round(scrollY + viewH / 2 - 100),
    size: 80,
    rotation: 0,
  });

  togglePicker();
  renderPageStickers();
}

// ── RENDER PLACED STICKERS ──

async function renderPageStickers() {
  document.querySelectorAll('.placed-sticker').forEach(el => el.remove());
  document.querySelector('.sticker-controls')?.remove();
  selectedSticker = null;

  const pageKey = location.hash.slice(1) || 'home';
  const all = await dbGetAll('stickers');
  const mine = all.filter(s => s.pageKey === pageKey);
  const content = document.getElementById('content');
  if (!content) return;

  mine.forEach(s => {
    const el = document.createElement('div');
    el.className = 'placed-sticker';
    el.dataset.id = s.id;
    el.style.left = s.x + 'px';
    el.style.top = s.y + 'px';
    el.style.width = s.size + 'px';
    el.style.height = s.size + 'px';
    if (s.rotation) el.style.transform = `rotate(${s.rotation}deg)`;

    const img = document.createElement('img');
    img.src = `images/stickers/${s.assetId}.png`;
    img.draggable = false;
    el.appendChild(img);

    setupStickerTouch(el, s.id);
    content.appendChild(el);
  });
}

// ── TOUCH & MOUSE INTERACTION ──

function setupStickerTouch(el, id) {
  let isDrag = false;
  let startX, startY, origLeft, origTop;
  let pinchStartDist = 0, pinchOrigSize = 0;
  let didMove = false;

  // ─ Touch ─
  el.addEventListener('touchstart', e => {
    e.stopPropagation();
    e.preventDefault();

    if (e.touches.length === 1) {
      isDrag = true;
      didMove = false;
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      origLeft = parseInt(el.style.left) || 0;
      origTop = parseInt(el.style.top) || 0;
    } else if (e.touches.length === 2) {
      isDrag = false;
      const t1 = e.touches[0], t2 = e.touches[1];
      pinchStartDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      pinchOrigSize = parseInt(el.style.width) || 80;
    }
  }, { passive: false });

  el.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 1 && isDrag) {
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didMove = true;
      el.style.left = (origLeft + dx) + 'px';
      el.style.top = (origTop + dy) + 'px';
    } else if (e.touches.length === 2 && pinchStartDist > 0) {
      const t1 = e.touches[0], t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const scale = dist / pinchStartDist;
      const newSize = Math.max(30, Math.min(300, Math.round(pinchOrigSize * scale)));
      el.style.width = newSize + 'px';
      el.style.height = newSize + 'px';
      didMove = true;
    }
  }, { passive: false });

  el.addEventListener('touchend', async () => {
    const sticker = await dbGet('stickers', id);
    if (sticker) {
      sticker.x = parseInt(el.style.left) || 0;
      sticker.y = parseInt(el.style.top) || 0;
      sticker.size = parseInt(el.style.width) || 80;
      await dbPut('stickers', sticker);
    }
    if (!didMove) {
      // Tap — toggle select
      if (selectedSticker === id) deselectSticker();
      else selectSticker(id);
    } else {
      selectSticker(id);
    }
    isDrag = false;
  });

  // ─ Mouse (desktop) ─
  el.addEventListener('mousedown', e => {
    e.stopPropagation();
    e.preventDefault();
    isDrag = true;
    didMove = false;
    startX = e.clientX;
    startY = e.clientY;
    origLeft = parseInt(el.style.left) || 0;
    origTop = parseInt(el.style.top) || 0;

    const onMove = ev => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didMove = true;
      el.style.left = (origLeft + dx) + 'px';
      el.style.top = (origTop + dy) + 'px';
    };

    const onUp = async () => {
      isDrag = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      const sticker = await dbGet('stickers', id);
      if (sticker) {
        sticker.x = parseInt(el.style.left) || 0;
        sticker.y = parseInt(el.style.top) || 0;
        await dbPut('stickers', sticker);
      }
      if (!didMove) {
        if (selectedSticker === id) deselectSticker();
        else selectSticker(id);
      } else {
        selectSticker(id);
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

// ── SELECT / DESELECT ──

function selectSticker(id) {
  deselectSticker();
  selectedSticker = id;
  const el = document.querySelector(`.placed-sticker[data-id="${id}"]`);
  if (!el) return;
  el.classList.add('selected');
  showStickerControls(el, id);
}

function deselectSticker() {
  document.querySelectorAll('.placed-sticker.selected').forEach(el => el.classList.remove('selected'));
  document.querySelector('.sticker-controls')?.remove();
  selectedSticker = null;
}

function showStickerControls(el, id) {
  document.querySelector('.sticker-controls')?.remove();

  const controls = document.createElement('div');
  controls.className = 'sticker-controls';
  controls.innerHTML = `
    <button class="sticker-ctrl delete" onclick="deletePlacedSticker(${id})" title="Удалить">&times;</button>
    <button class="sticker-ctrl rotate" onclick="rotatePlacedSticker(${id})" title="Повернуть">&#8635;</button>
    <button class="sticker-ctrl bigger" onclick="resizePlacedSticker(${id}, 1.3)" title="Больше">+</button>
    <button class="sticker-ctrl smaller" onclick="resizePlacedSticker(${id}, 0.7)" title="Меньше">&minus;</button>
  `;

  // Position above sticker
  const top = parseInt(el.style.top) || 0;
  const left = parseInt(el.style.left) || 0;
  controls.style.left = left + 'px';
  controls.style.top = (top - 44) + 'px';

  document.getElementById('content').appendChild(controls);
}

// ── STICKER ACTIONS ──

async function deletePlacedSticker(id) {
  await dbDelete('stickers', id);
  renderPageStickers();
}

async function rotatePlacedSticker(id) {
  const s = await dbGet('stickers', id);
  if (!s) return;
  s.rotation = ((s.rotation || 0) + 45) % 360;
  await dbPut('stickers', s);
  renderPageStickers();
  setTimeout(() => selectSticker(id), 30);
}

async function resizePlacedSticker(id, factor) {
  const s = await dbGet('stickers', id);
  if (!s) return;
  s.size = Math.max(30, Math.min(300, Math.round(s.size * factor)));
  await dbPut('stickers', s);
  renderPageStickers();
  setTimeout(() => selectSticker(id), 30);
}
