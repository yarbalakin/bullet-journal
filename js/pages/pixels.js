// Year in Pixels — mood mosaic for the whole year
async function renderPixels(container) {
  const now = new Date();
  const year = now.getFullYear();

  const allMoods = await dbGetAll('moods');
  const moodMap = {};
  allMoods.forEach(m => { moodMap[m.date] = m.level; });

  // Stats
  let counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, total: 0 };
  allMoods.filter(m => m.date.startsWith(String(year))).forEach(m => {
    counts[m.level]++;
    counts.total++;
  });

  // Build grid: 12 months × up to 31 days
  let gridHTML = '';
  gridHTML += '<div class="pixels-header-row">';
  gridHTML += '<div class="pixels-corner"></div>';
  for (let m = 0; m < 12; m++) {
    gridHTML += `<div class="pixels-month-label">${MONTH_NAMES[m].slice(0, 3)}</div>`;
  }
  gridHTML += '</div>';

  for (let d = 1; d <= 31; d++) {
    gridHTML += '<div class="pixels-row">';
    gridHTML += `<div class="pixels-day-label">${d}</div>`;
    for (let m = 0; m < 12; m++) {
      const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const daysInMonth = new Date(year, m + 1, 0).getDate();
      if (d > daysInMonth) {
        gridHTML += '<div class="pixel empty"></div>';
      } else {
        const level = moodMap[dateStr];
        const bg = level ? MOOD_COLORS[level] : 'var(--surface3)';
        const isToday = dateStr === now.toISOString().slice(0, 10);
        gridHTML += `<div class="pixel ${isToday ? 'pixel-today' : ''}" style="background:${bg}" title="${dateStr}${level ? ' — ' + MOOD_LABELS[level] : ''}"></div>`;
      }
    }
    gridHTML += '</div>';
  }

  container.innerHTML = `
    <div class="page-pixels">
      <div class="day-header">
        <button class="back-btn" onclick="navigate('home')">&larr;</button>
        <h2>Year in Pixels ${year}</h2>
      </div>

      <div class="pixels-stats">
        ${[5,4,3,2,1].map(l => `
          <div class="pixels-stat">
            <div class="pixels-stat-dot" style="background:${MOOD_COLORS[l]}"></div>
            <span class="pixels-stat-label">${MOOD_LABELS[l]}</span>
            <span class="pixels-stat-count">${counts[l]}</span>
          </div>
        `).join('')}
        <div class="pixels-stat total">
          <span class="pixels-stat-label">Всего дней</span>
          <span class="pixels-stat-count">${counts.total}</span>
        </div>
      </div>

      <div class="pixels-grid">${gridHTML}</div>
    </div>
  `;
}

route('pixels', renderPixels);
