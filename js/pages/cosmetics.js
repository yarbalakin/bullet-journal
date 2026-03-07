// Cosmetics tracker page
const PAO_DEFAULTS = {
  'mascara': { label: 'Тушь для ресниц', months: 4 },
  'eyeliner': { label: 'Подводка', months: 4 },
  'foundation': { label: 'Тональный крем', months: 9 },
  'concealer': { label: 'Консилер', months: 9 },
  'face_cream': { label: 'Крем для лица', months: 8 },
  'lipstick': { label: 'Помада', months: 15 },
  'blush': { label: 'Румяна', months: 12 },
  'eyeshadow': { label: 'Тени', months: 24 },
  'powder': { label: 'Пудра', months: 24 },
  'pencil': { label: 'Карандаш для глаз', months: 24 },
  'perfume': { label: 'Духи', months: 36 },
  'other': { label: 'Другое', months: 12 },
};

async function renderCosmetics(container) {
  const items = await dbGetAll('cosmetics');
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // Categorize
  const expired = [];
  const expiringSoon = []; // within 30 days
  const active = [];

  items.forEach(item => {
    if (item.expireDate <= todayStr) expired.push(item);
    else {
      const daysLeft = Math.ceil((new Date(item.expireDate) - now) / 86400000);
      if (daysLeft <= 30) expiringSoon.push(item);
      else active.push(item);
    }
  });

  const renderItem = (item) => {
    const daysLeft = Math.ceil((new Date(item.expireDate) - now) / 86400000);
    const isExpired = daysLeft <= 0;
    const isSoon = daysLeft > 0 && daysLeft <= 30;
    const statusClass = isExpired ? 'expired' : isSoon ? 'soon' : 'ok';
    const statusText = isExpired ? 'просрочено' : isSoon ? `${daysLeft} дн.` : `до ${item.expireDate.slice(5)}`;

    return `
      <div class="cosm-row ${statusClass}" onclick="showCosmeticDetail(${item.id})">
        <div class="cosm-indicator"></div>
        <div class="cosm-info">
          <div class="cosm-name">${item.name}</div>
          <div class="cosm-brand">${item.brand || item.type || ''}</div>
        </div>
        <div class="cosm-status">${statusText}</div>
      </div>
    `;
  };

  container.innerHTML = `
    <div class="page-cosmetics">
      <div class="cosm-header">
        <h2>Косметика</h2>
        <button class="cosm-add-btn" onclick="showAddCosmetic()">+ Добавить</button>
      </div>

      ${expired.length ? `
        <div class="cosm-group">
          <div class="cosm-group-label expired-label">Просрочено (${expired.length})</div>
          ${expired.map(renderItem).join('')}
        </div>
      ` : ''}

      ${expiringSoon.length ? `
        <div class="cosm-group">
          <div class="cosm-group-label soon-label">Скоро истекает (${expiringSoon.length})</div>
          ${expiringSoon.map(renderItem).join('')}
        </div>
      ` : ''}

      ${active.length ? `
        <div class="cosm-group">
          <div class="cosm-group-label ok-label">Активная (${active.length})</div>
          ${active.map(renderItem).join('')}
        </div>
      ` : ''}

      ${!items.length ? '<div class="empty-state">Пока пусто. Добавь первый продукт!</div>' : ''}
    </div>
  `;
}

let barcodeScanner = null;

function showAddCosmetic() {
  const content = document.getElementById('content');
  const typeOptions = Object.entries(PAO_DEFAULTS)
    .map(([k, v]) => `<option value="${k}">${v.label} (${v.months} мес.)</option>`)
    .join('');

  content.innerHTML = `
    <div class="page-cosmetics">
      <div class="cosm-header">
        <button class="back-btn" onclick="stopScanner(); navigate('cosmetics')">&larr;</button>
        <h2>Добавить продукт</h2>
      </div>

      <button class="cosm-scan-btn" onclick="startScanner()">Сканировать штрихкод</button>
      <div id="scanner-container" class="scanner-container" style="display:none">
        <div id="scanner-view"></div>
        <button class="scanner-close-btn" onclick="stopScanner()">Закрыть камеру</button>
      </div>
      <div id="scanner-status" class="scanner-status" style="display:none"></div>

      <form class="cosm-form" onsubmit="saveCosmetic(event)">
        <label class="form-label">Название
          <input type="text" name="name" class="form-input" placeholder="Тушь L'Oreal Volume" required>
        </label>

        <label class="form-label">Бренд
          <input type="text" name="brand" class="form-input" placeholder="L'Oreal">
        </label>

        <label class="form-label">Тип продукта
          <select name="type" class="form-input" onchange="updatePAO(this)">
            ${typeOptions}
          </select>
        </label>

        <label class="form-label">Дата вскрытия
          <input type="date" name="openDate" class="form-input" value="${new Date().toISOString().slice(0,10)}">
        </label>

        <label class="form-label">Срок годности (месяцев после вскрытия)
          <input type="number" name="paoMonths" class="form-input" value="4" min="1" max="120">
        </label>

        <div class="form-expire-preview">
          Истекает: <span id="expire-preview">—</span>
        </div>

        <button type="submit" class="form-submit">Сохранить</button>
      </form>
    </div>
  `;

  // Init expire preview
  updateExpirePreview();
  document.querySelector('[name="openDate"]').addEventListener('change', updateExpirePreview);
  document.querySelector('[name="paoMonths"]').addEventListener('input', updateExpirePreview);
}

async function startScanner() {
  const container = document.getElementById('scanner-container');
  const status = document.getElementById('scanner-status');
  container.style.display = 'block';
  status.style.display = 'none';

  try {
    barcodeScanner = new Html5Qrcode('scanner-view');
    await barcodeScanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 150 }, formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
      ]},
      onBarcodeScanned,
      () => {} // ignore errors during scanning
    );
  } catch (err) {
    container.style.display = 'none';
    status.style.display = 'block';
    status.textContent = 'Камера недоступна: ' + (err.message || err);
    status.className = 'scanner-status error';
  }
}

function stopScanner() {
  if (barcodeScanner) {
    barcodeScanner.stop().catch(() => {});
    barcodeScanner = null;
  }
  const container = document.getElementById('scanner-container');
  if (container) container.style.display = 'none';
}

async function onBarcodeScanned(barcode) {
  stopScanner();
  const status = document.getElementById('scanner-status');
  status.style.display = 'block';
  status.textContent = 'Ищу ' + barcode + '...';
  status.className = 'scanner-status loading';

  try {
    const res = await fetch(`https://world.openbeautyfacts.org/api/v2/product/${barcode}.json`);
    const data = await res.json();

    if (data.status === 1 && data.product) {
      const p = data.product;
      const name = p.product_name || p.product_name_ru || '';
      const brand = p.brands || '';

      if (name) document.querySelector('[name="name"]').value = name;
      if (brand) document.querySelector('[name="brand"]').value = brand;

      status.textContent = name ? `Найдено: ${name}` : 'Продукт найден, заполни название';
      status.className = 'scanner-status success';
    } else {
      status.textContent = `Штрихкод ${barcode} не найден в базе. Заполни вручную.`;
      status.className = 'scanner-status warning';
    }
  } catch (err) {
    status.textContent = 'Ошибка поиска. Заполни вручную.';
    status.className = 'scanner-status error';
  }
}

function updatePAO(select) {
  const pao = PAO_DEFAULTS[select.value]?.months || 12;
  document.querySelector('[name="paoMonths"]').value = pao;
  updateExpirePreview();
}

function updateExpirePreview() {
  const openDate = document.querySelector('[name="openDate"]')?.value;
  const pao = parseInt(document.querySelector('[name="paoMonths"]')?.value || '12');
  if (openDate) {
    const d = new Date(openDate);
    d.setMonth(d.getMonth() + pao);
    document.getElementById('expire-preview').textContent = d.toLocaleDateString('ru-RU');
  }
}

async function saveCosmetic(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const openDate = fd.get('openDate');
  const paoMonths = parseInt(fd.get('paoMonths'));
  const expireDate = new Date(openDate);
  expireDate.setMonth(expireDate.getMonth() + paoMonths);

  await dbPut('cosmetics', {
    name: fd.get('name'),
    brand: fd.get('brand'),
    type: fd.get('type'),
    openDate,
    paoMonths,
    expireDate: expireDate.toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
  });

  navigate('cosmetics');
}

async function showCosmeticDetail(id) {
  const item = await dbGet('cosmetics', id);
  if (!item) return navigate('cosmetics');

  const now = new Date();
  const daysLeft = Math.ceil((new Date(item.expireDate) - now) / 86400000);
  const isExpired = daysLeft <= 0;
  const typeLabel = PAO_DEFAULTS[item.type]?.label || item.type || '—';

  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="page-cosmetics">
      <div class="cosm-header">
        <button class="back-btn" onclick="navigate('cosmetics')">&larr;</button>
        <h2>${item.name}</h2>
      </div>

      <div class="cosm-detail">
        ${item.brand ? `<div class="cosm-detail-row"><span class="cosm-detail-label">Бренд</span><span>${item.brand}</span></div>` : ''}
        <div class="cosm-detail-row"><span class="cosm-detail-label">Тип</span><span>${typeLabel}</span></div>
        <div class="cosm-detail-row"><span class="cosm-detail-label">Дата вскрытия</span><span>${item.openDate}</span></div>
        <div class="cosm-detail-row"><span class="cosm-detail-label">Срок (PAO)</span><span>${item.paoMonths} мес.</span></div>
        <div class="cosm-detail-row"><span class="cosm-detail-label">Истекает</span><span>${item.expireDate}</span></div>
        <div class="cosm-detail-row ${isExpired ? 'expired' : daysLeft <= 30 ? 'soon' : 'ok'}">
          <span class="cosm-detail-label">Статус</span>
          <span>${isExpired ? 'Просрочено' : `Осталось ${daysLeft} дн.`}</span>
        </div>
      </div>

      <button class="cosm-delete-btn" onclick="deleteCosmetic(${id})">Удалить продукт</button>
    </div>
  `;
}

async function deleteCosmetic(id) {
  await dbDelete('cosmetics', id);
  navigate('cosmetics');
}

route('cosmetics', renderCosmetics);
