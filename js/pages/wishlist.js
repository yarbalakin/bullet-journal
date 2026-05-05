// Wishlist — список желаний
const WISH_CATEGORIES = [
  { id: 'clothes',  label: 'Одежда',       icon: '👗' },
  { id: 'beauty',   label: 'Красота',      icon: '💄' },
  { id: 'home',     label: 'Дом',          icon: '🏠' },
  { id: 'books',    label: 'Книги',        icon: '📚' },
  { id: 'travel',   label: 'Путешествия',  icon: '✈️' },
  { id: 'other',    label: 'Другое',       icon: '✨' },
];

let wishlistFilter = 'want';
let wishPendingImage = null; // base64 выбранного фото до сохранения

async function renderWishlist(container) {
  const entry = await dbGet('collections', 'wishlist') || { id: 'wishlist', items: [] };
  const items = entry.items || [];

  const filtered = wishlistFilter === 'all'    ? items
                 : wishlistFilter === 'want'   ? items.filter(i => !i.done)
                 :                              items.filter(i => i.done);

  const wantSum   = items.filter(i => !i.done && i.price).reduce((s, i) => s + i.price, 0);
  const boughtSum = items.filter(i =>  i.done && i.price).reduce((s, i) => s + i.price, 0);

  const getCatIcon = (catId) => (WISH_CATEGORIES.find(c => c.id === catId) || WISH_CATEGORIES[5]).icon;
  const fmt = (p) => p ? p.toLocaleString('ru-RU') + ' ₽' : '';

  const wantCount   = items.filter(i => !i.done).length;
  const boughtCount = items.filter(i =>  i.done).length;

  const renderThumb = (item, idx) => item.image
    ? `<img class="wish-thumb" src="${item.image}" alt="" onclick="openWishLightbox(${idx})">`
    : `<span class="wish-cat-icon">${getCatIcon(item.category)}</span>`;

  container.innerHTML = `
    <div class="page-wishlist">
      <div class="wish-header">
        <button class="future-back" onclick="navigate('home')">&#8592;</button>
        <h2>Вишлист</h2>
        <button class="wish-add-fab" onclick="openWishModal()">+</button>
      </div>

      <div class="wish-filter">
        <button class="wish-filter-btn ${wishlistFilter === 'all'    ? 'active' : ''}" onclick="setWishFilter('all')">Все${items.length ? ' (' + items.length + ')' : ''}</button>
        <button class="wish-filter-btn ${wishlistFilter === 'want'   ? 'active' : ''}" onclick="setWishFilter('want')">Хочу${wantCount ? ' (' + wantCount + ')' : ''}</button>
        <button class="wish-filter-btn ${wishlistFilter === 'bought' ? 'active' : ''}" onclick="setWishFilter('bought')">Куплено${boughtCount ? ' (' + boughtCount + ')' : ''}</button>
      </div>

      ${(wantSum || boughtSum) ? `
        <div class="wish-totals">
          ${wantSum   ? `<span class="wish-total-item">Хочу: <b>${fmt(wantSum)}</b></span>` : ''}
          ${boughtSum ? `<span class="wish-total-item bought">Куплено: <b>${fmt(boughtSum)}</b></span>` : ''}
        </div>
      ` : ''}

      <div class="wish-list">
        ${filtered.length === 0 ? `
          <div class="wish-empty">${wishlistFilter === 'bought' ? 'Ещё ничего не куплено' : 'Вишлист пуст'}</div>
        ` : filtered.map(item => {
          const realIdx = items.indexOf(item);
          return `
            <div class="wish-card ${item.done ? 'done' : ''}">
              <div class="wish-card-left">
                ${renderThumb(item, realIdx)}
                <div class="wish-card-info">
                  <span class="wish-card-name">${item.text}</span>
                  ${item.price ? `<span class="wish-card-price">${fmt(item.price)}</span>` : ''}
                </div>
              </div>
              <div class="wish-card-actions">
                <label class="wish-photo-btn" title="Фото">
                  &#128247;
                  <input type="file" accept="image/*" style="display:none"
                         onchange="attachWishPhoto(event, ${realIdx})">
                </label>
                ${item.url ? `<a class="wish-link-btn" href="${item.url}" target="_blank" rel="noopener">&#128279;</a>` : ''}
                <button class="wish-check-btn ${item.done ? 'checked' : ''}" onclick="toggleWishItem(${realIdx})">
                  ${item.done ? '&#10003;' : ''}
                </button>
                <button class="wish-delete-btn" onclick="deleteWishItem(${realIdx})">&#215;</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Модалка добавления -->
    <div class="wish-modal-overlay" id="wishModal" style="display:none" onclick="closeWishModal(event)">
      <div class="wish-modal">
        <h3 class="wish-modal-title">Добавить желание</h3>
        <form onsubmit="addWishItem(event)">
          <div class="wish-field">
            <label class="wish-label">Название *</label>
            <input class="wish-input" id="wishText" type="text" placeholder="Что хочу..." required>
          </div>
          <div class="wish-field">
            <label class="wish-label">Цена (₽)</label>
            <input class="wish-input" id="wishPrice" type="number" placeholder="0" min="0">
          </div>
          <div class="wish-field">
            <label class="wish-label">Ссылка</label>
            <input class="wish-input" id="wishUrl" type="url" placeholder="https://...">
          </div>
          <div class="wish-field">
            <label class="wish-label">Категория</label>
            <select class="wish-input" id="wishCat">
              ${WISH_CATEGORIES.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('')}
            </select>
          </div>
          <div class="wish-field">
            <label class="wish-label">Фото</label>
            <label class="wish-photo-pick">
              <div id="wishImgPreview" class="wish-img-preview">
                <span>&#128247; Выбрать фото</span>
              </div>
              <input type="file" accept="image/*" id="wishImgInput" style="display:none"
                     onchange="previewWishImage(event)">
            </label>
          </div>
          <div class="wish-modal-btns">
            <button type="button" class="wish-modal-cancel" onclick="closeWishModal()">Отмена</button>
            <button type="submit" class="wish-modal-submit">Добавить</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Лайтбокс -->
    <div class="wish-lightbox" id="wishLightbox" style="display:none" onclick="closeWishLightbox()">
      <img id="wishLightboxImg" src="" alt="">
    </div>
  `;
}

// Ресайз фото через canvas до maxSize px по длинной стороне
function resizeWishImage(file, maxSize = 800) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
          else       { w = Math.round(w * maxSize / h); h = maxSize; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function previewWishImage(e) {
  const file = e.target.files[0];
  if (!file) return;
  resizeWishImage(file).then(b64 => {
    wishPendingImage = b64;
    const preview = document.getElementById('wishImgPreview');
    if (preview) {
      preview.innerHTML = `<img src="${b64}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`;
    }
  });
}

async function attachWishPhoto(e, index) {
  const file = e.target.files[0];
  if (!file) return;
  const b64 = await resizeWishImage(file);
  const entry = await dbGet('collections', 'wishlist');
  if (!entry) return;
  entry.items[index].image = b64;
  await dbPut('collections', entry);
  navigate('wishlist');
}

function openWishLightbox(index) {
  dbGet('collections', 'wishlist').then(entry => {
    if (!entry?.items?.[index]?.image) return;
    const lb = document.getElementById('wishLightbox');
    const img = document.getElementById('wishLightboxImg');
    if (!lb || !img) return;
    img.src = entry.items[index].image;
    lb.style.display = 'flex';
  });
}

function closeWishLightbox() {
  const lb = document.getElementById('wishLightbox');
  if (lb) lb.style.display = 'none';
}

function openWishModal() {
  wishPendingImage = null;
  const modal = document.getElementById('wishModal');
  modal.style.display = 'flex';
  setTimeout(() => document.getElementById('wishText')?.focus(), 50);
}

function closeWishModal(e) {
  if (!e || e.target.id === 'wishModal') {
    wishPendingImage = null;
    document.getElementById('wishModal').style.display = 'none';
  }
}

function setWishFilter(filter) {
  wishlistFilter = filter;
  navigate('wishlist');
}

async function addWishItem(e) {
  e.preventDefault();
  const text  = document.getElementById('wishText').value.trim();
  if (!text) return;
  const priceVal = parseFloat(document.getElementById('wishPrice').value);
  const url      = document.getElementById('wishUrl').value.trim();
  const category = document.getElementById('wishCat').value;

  const entry = await dbGet('collections', 'wishlist') || { id: 'wishlist', items: [] };
  const item = { text, category, done: false, addedAt: new Date().toISOString().slice(0, 10) };
  if (priceVal > 0) item.price = priceVal;
  if (url) item.url = url;
  if (wishPendingImage) item.image = wishPendingImage;
  entry.items.push(item);
  await dbPut('collections', entry);
  wishPendingImage = null;
  navigate('wishlist');
}

async function toggleWishItem(index) {
  const entry = await dbGet('collections', 'wishlist');
  if (!entry) return;
  entry.items[index].done = !entry.items[index].done;
  await dbPut('collections', entry);
  navigate('wishlist');
}

async function deleteWishItem(index) {
  const entry = await dbGet('collections', 'wishlist');
  if (!entry) return;
  entry.items.splice(index, 1);
  await dbPut('collections', entry);
  navigate('wishlist');
}

route('wishlist', renderWishlist);
