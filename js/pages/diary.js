// Diary — all day notes in one place, sorted by date
async function renderDiary(container) {
  const allNotes = await dbGetAll('daynotes');
  // Only entries that have text content
  const entries = allNotes
    .filter(n => n.text && n.text.trim())
    .sort((a, b) => b.date.localeCompare(a.date));

  const DAY_NAMES = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
  const MONTH_NAMES_SHORT = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    const day = d.getDate();
    const mon = MONTH_NAMES_SHORT[d.getMonth()];
    const dow = DAY_NAMES[d.getDay()];
    return `${day} ${mon}, ${dow}`;
  }

  const entriesHTML = entries.length
    ? entries.map(n => `
        <div class="diary-entry" onclick="navigate('day', { date: '${n.date}' })">
          <div class="diary-entry-date">${formatDate(n.date)}</div>
          <div class="diary-entry-text">${n.text.replace(/\n/g, '<br>')}</div>
        </div>
      `).join('')
    : '<div class="diary-empty">Пока нет ни одной заметки дня</div>';

  container.innerHTML = `
    <div class="page-diary">
      <div class="diary-page-header">
        <button class="back-btn" onclick="navigate('home')">&larr;</button>
        <h2>Заметки дня</h2>
      </div>
      <div class="diary-entries">
        ${entriesHTML}
      </div>
    </div>
  `;
}

route('diary', renderDiary);
