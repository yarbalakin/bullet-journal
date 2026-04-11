// Life Wheel — monthly life area checklist (1-10)
const LIFE_AREAS = [
  'Общее состояние',
  'Благодарность',
  'Осознанность',
  'Семья',
  'Друзья',
  'Личная жизнь',
  'Развлечения',
  'Спокойствие и невозмутимость',
  'Время, выделенное для себя',
  'Здоровая пища',
  'Питье воды',
  'Спорт',
  'Прогулки на свежем воздухе',
  'Здоровье',
  'Творческие занятия',
  'Финансы',
  'Работа и образование',
  'Мысли и эмоции',
  'Настоящее',
  'Будущее'
];

function lwScoreColor(v) {
  if (v >= 7) return '#6a9a6a';
  if (v >= 4) return '#d4a030';
  return '#c05050';
}

function lwPrevMonthId(monthId) {
  const [y, m] = monthId.split('-').map(Number);
  const pm = m - 1;
  if (pm < 1) return `${y - 1}-12`;
  return `${y}-${String(pm).padStart(2, '0')}`;
}

async function renderLifewheel(container, params = {}) {
  const now = new Date();
  const year = params.year ?? now.getFullYear();
  const month = params.month ?? now.getMonth();
  const monthId = `${year}-${String(month + 1).padStart(2, '0')}`;

  const current = await dbGet('lifewheel', monthId);
  const prev = await dbGet('lifewheel', lwPrevMonthId(monthId));
  const scores = current?.scores || {};

  // Check if showing dynamics
  if (params.view === 'dynamics') {
    return renderDynamics(container, params);
  }

  // Build rows
  const rowsHTML = LIFE_AREAS.map(area => {
    const val = scores[area] || 0;
    const prevVal = prev?.scores?.[area];
    let deltaHTML = '';
    if (prevVal !== undefined && val > 0) {
      const diff = val - prevVal;
      if (diff > 0) deltaHTML = `<span class="lw-delta lw-up">+${diff}</span>`;
      else if (diff < 0) deltaHTML = `<span class="lw-delta lw-down">${diff}</span>`;
      else deltaHTML = `<span class="lw-delta lw-same">=</span>`;
    }

    const btns = [];
    for (let i = 1; i <= 10; i++) {
      const active = val === i;
      const color = active ? lwScoreColor(i) : '';
      btns.push(`<button class="lw-btn ${active ? 'active' : ''}" style="${active ? 'background:' + color + ';color:#fff;border-color:' + color : ''}" onclick="lwSetScore('${monthId}', '${area.replace(/'/g, "\\'")}', ${i}, ${year}, ${month})">${i}</button>`);
    }

    // Bar visualization (only if scored)
    const barHTML = val > 0 ? `<div class="lw-bar-track"><div class="lw-bar-fill" style="width:${val * 10}%;background:${lwScoreColor(val)}"></div></div>` : '';


    return `
      <div class="lw-row" data-area="${area.replace(/"/g, '&quot;')}">
        <div class="lw-row-header">
          <span class="lw-area-name">${area}</span>
          ${deltaHTML}
        </div>
        <div class="lw-buttons">${btns.join('')}</div>
        ${barHTML ? `<div class="lw-bar-wrap">${barHTML}</div>` : '<div class="lw-bar-wrap"></div>'}
      </div>
    `;
  }).join('');

  // Summary stats
  const scored = LIFE_AREAS.filter(a => scores[a] > 0);
  let summaryHTML = '';
  if (scored.length === LIFE_AREAS.length) {
    const total = scored.reduce((s, a) => s + scores[a], 0);
    const avg = (total / scored.length).toFixed(1);
    summaryHTML = `
      <div class="lw-summary">
        <span>Заполнено: ${scored.length}/${LIFE_AREAS.length}</span>
        <button class="lw-dynamics-btn" onclick="navigate('lifewheel', { year: ${year}, month: ${month}, view: 'dynamics' })">Динамика</button>
      </div>
    `;
  } else if (scored.length > 0) {
    summaryHTML = `<div class="lw-summary"><span>Заполнено: ${scored.length}/${LIFE_AREAS.length}</span></div>`;
  }

  container.innerHTML = `
    <div class="page-lifewheel">
      <div class="day-header">
        <button class="back-btn" onclick="navigate('calendar', { year: ${year}, month: ${month} })">&larr;</button>
        <div class="day-header-info">
          <h2>Чек-лист месяца</h2>
          <div class="day-weekday">${MONTH_NAMES[month]} ${year}</div>
        </div>
      </div>
      ${summaryHTML}
      <div class="lw-list">${rowsHTML}</div>
      <div class="lw-bottom-pad"></div>
    </div>
  `;
}

async function lwSetScore(monthId, area, value, year, month) {
  let data = await dbGet('lifewheel', monthId);
  if (!data) {
    data = { id: monthId, scores: {}, completedAt: null };
  }
  // Toggle: tap same value to unset
  if (data.scores[area] === value) {
    delete data.scores[area];
  } else {
    data.scores[area] = value;
  }
  // Check if all scored
  const scored = LIFE_AREAS.filter(a => data.scores[a] > 0);
  if (scored.length === LIFE_AREAS.length && !data.completedAt) {
    data.completedAt = new Date().toISOString();
  }
  await dbPut('lifewheel', data);

  // Update only the changed row — no full re-render, no scroll jump
  const val = data.scores[area] || 0;
  const prev = await dbGet('lifewheel', lwPrevMonthId(monthId));
  const prevVal = prev?.scores?.[area];

  const row = document.querySelector(`.lw-row[data-area="${area.replace(/"/g, '&quot;')}"]`);
  if (row) {
    // Update buttons
    const btnsHTML = [];
    for (let i = 1; i <= 10; i++) {
      const active = val === i;
      const color = active ? lwScoreColor(i) : '';
      btnsHTML.push(`<button class="lw-btn ${active ? 'active' : ''}" style="${active ? 'background:' + color + ';color:#fff;border-color:' + color : ''}" onclick="lwSetScore('${monthId}', '${area.replace(/'/g, "\\'")}', ${i}, ${year}, ${month})">${i}</button>`);
    }
    row.querySelector('.lw-buttons').innerHTML = btnsHTML.join('');

    // Update bar
    const barWrap = row.querySelector('.lw-bar-wrap');
    if (barWrap) {
      barWrap.innerHTML = val > 0 ? `<div class="lw-bar-track"><div class="lw-bar-fill" style="width:${val * 10}%;background:${lwScoreColor(val)}"></div></div>` : '';
    }

    // Update delta
    let deltaHTML = '';
    if (prevVal !== undefined && val > 0) {
      const diff = val - prevVal;
      if (diff > 0) deltaHTML = `<span class="lw-delta lw-up">+${diff}</span>`;
      else if (diff < 0) deltaHTML = `<span class="lw-delta lw-down">${diff}</span>`;
      else deltaHTML = `<span class="lw-delta lw-same">=</span>`;
    }
    const existingDelta = row.querySelector('.lw-delta');
    if (existingDelta) existingDelta.remove();
    if (deltaHTML) row.querySelector('.lw-row-header').insertAdjacentHTML('beforeend', deltaHTML);
  }

  // Update summary
  const allScored = LIFE_AREAS.filter(a => data.scores[a] > 0);
  const summaryEl = document.querySelector('.lw-summary');
  if (summaryEl) {
    if (allScored.length === LIFE_AREAS.length) {
      const total = allScored.reduce((s, a) => s + data.scores[a], 0);
      const avg = (total / allScored.length).toFixed(1);
      summaryEl.innerHTML = `<span>Заполнено: ${allScored.length}/${LIFE_AREAS.length}</span><button class="lw-dynamics-btn" onclick="navigate('lifewheel', { year: ${year}, month: ${month}, view: 'dynamics' })">Динамика</button>`;
    } else {
      summaryEl.innerHTML = `<span>Заполнено: ${allScored.length}/${LIFE_AREAS.length}</span>`;
    }
  } else if (allScored.length > 0) {
    // Insert summary if it didn't exist before
    const list = document.querySelector('.lw-list');
    if (list) {
      const div = document.createElement('div');
      div.className = 'lw-summary';
      div.innerHTML = `<span>Заполнено: ${allScored.length}/${LIFE_AREAS.length}</span>`;
      list.before(div);
    }
  }
}

// ── Dynamics view ──
async function renderDynamics(container, params) {
  const year = params.year;
  const month = params.month;

  // Load all lifewheel data
  const allData = await dbGetAll('lifewheel');
  allData.sort((a, b) => a.id.localeCompare(b.id));

  if (allData.length === 0) {
    container.innerHTML = `
      <div class="page-lifewheel">
        <div class="day-header">
          <button class="back-btn" onclick="navigate('lifewheel', { year: ${year}, month: ${month} })">&larr;</button>
          <h2>Динамика</h2>
        </div>
        <div class="day-empty">Нет данных. Заполните хотя бы один месяц.</div>
      </div>
    `;
    return;
  }

  // Month labels
  const SHORT_MONTHS = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
  const monthLabels = allData.map(d => {
    const [y, m] = d.id.split('-').map(Number);
    return SHORT_MONTHS[m - 1] + ' ' + String(y).slice(2);
  });

  // Build area selector + chart for each area
  const areasHTML = LIFE_AREAS.map((area, idx) => {
    const values = allData.map(d => d.scores?.[area] || 0);
    const hasData = values.some(v => v > 0);
    if (!hasData) return '';

    // Horizontal bar chart for this area across months
    const barsHTML = allData.map((d, i) => {
      const v = d.scores?.[area] || 0;
      if (v === 0) return `<div class="dyn-bar-row"><span class="dyn-month">${monthLabels[i]}</span><span class="dyn-no-data">-</span></div>`;
      return `<div class="dyn-bar-row">
        <span class="dyn-month">${monthLabels[i]}</span>
        <div class="dyn-bar-track">
          <div class="dyn-bar-fill" style="width:${v * 10}%;background:${lwScoreColor(v)}"></div>
        </div>
        <span class="dyn-bar-val">${v}</span>
      </div>`;
    }).join('');

    return `
      <details class="dyn-area" ${idx === 0 ? 'open' : ''}>
        <summary class="dyn-area-name">${area}</summary>
        <div class="dyn-bars">${barsHTML}</div>
      </details>
    `;
  }).join('');

  container.innerHTML = `
    <div class="page-lifewheel">
      <div class="day-header">
        <button class="back-btn" onclick="navigate('lifewheel', { year: ${year}, month: ${month} })">&larr;</button>
        <div class="day-header-info">
          <h2>Динамика</h2>
          <div class="day-weekday">Все месяцы</div>
        </div>
      </div>
      <div class="dyn-list">${areasHTML}</div>
      <div class="lw-bottom-pad"></div>
    </div>
  `;
}

route('lifewheel', renderLifewheel);
