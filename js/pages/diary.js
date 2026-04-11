// Diary — all day notes in one feed, newest first
async function renderDiary(container) {
  const allDayNotes = await dbGetAll('daynotes');

  const DAY_NAMES = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
  const MONTH_NAMES_SHORT = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return `${d.getDate()} ${MONTH_NAMES_SHORT[d.getMonth()]}, ${DAY_NAMES[d.getDay()]}`;
  }

  function formatTime(isoStr) {
    if (!isoStr) return '';
    return new Date(isoStr).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }

  // Flatten all notes into a single array: [{date, text, createdAt, noteId}]
  const flatNotes = [];
  for (const dayEntry of allDayNotes) {
    if (Array.isArray(dayEntry.notes) && dayEntry.notes.length) {
      for (const n of dayEntry.notes) {
        if (n.text?.trim()) flatNotes.push({ date: dayEntry.date, text: n.text, createdAt: n.createdAt, noteId: n.id });
      }
    } else if (dayEntry.text?.trim()) {
      // Legacy single-text entry
      flatNotes.push({ date: dayEntry.date, text: dayEntry.text, createdAt: dayEntry.date + 'T00:00:00.000Z', noteId: 'legacy' });
    }
  }

  // Sort newest first by createdAt
  flatNotes.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const entriesHTML = flatNotes.length
    ? flatNotes.map(n => `
        <div class="diary-entry" onclick="navigate('day', { date: '${n.date}', scrollTo: 'notes' })">
          <div class="diary-entry-header">
            <span class="diary-entry-date">${formatDate(n.date)}</span>
            ${n.noteId !== 'legacy' ? `<span class="diary-entry-time">${formatTime(n.createdAt)}</span>` : ''}
          </div>
          <div class="diary-entry-text">${n.text.replace(/\n/g, '<br>')}</div>
        </div>
      `).join('')
    : '<div class="diary-empty">Пока нет ни одной заметки дня</div>';

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  container.innerHTML = `
    <div class="page-diary">
      <div class="diary-page-header">
        <button class="back-btn" onclick="navigate('home')">&larr;</button>
        <h2>Дневник</h2>
        <button class="day-add-btn diary-add-entry-btn" onclick="navigate('day', { date: '${todayStr}', scrollTo: 'notes' })" title="Добавить запись">+</button>
      </div>
      <div class="diary-entries">
        ${entriesHTML}
      </div>
    </div>
  `;
}

route('diary', renderDiary);
