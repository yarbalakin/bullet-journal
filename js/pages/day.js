// Day detail page — events + tasks + mood for a specific day
async function renderDay(container, params = {}) {
  const dateStr = params.date;
  if (!dateStr) return navigate('calendar');

  const d = new Date(dateStr);
  const dayNum = d.getDate();
  const monthIdx = d.getMonth();
  const year = d.getFullYear();
  const monthId = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;
  const dayOfWeek = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'][d.getDay()];

  // Load data
  const mood = await dbGet('moods', dateStr);
  const allEvents = await dbGetAll('events');
  const dayEvents = allEvents.filter(e => e.date === dateStr).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  const allTasks = await dbGetByIndex('tasks', 'monthId', monthId);
  const dayTasks = allTasks.filter(t => t.date === dateStr);
  const dayNote = await dbGet('daynotes', dateStr);

  // Mood section
  const moodHTML = `
    <div class="day-section">
      <div class="day-section-title">Настроение</div>
      <div class="mood-picker">
        ${[1,2,3,4,5].map(level => `
          <button class="mood-btn ${mood?.level === level ? 'active' : ''}"
                  style="background:${MOOD_COLORS[level]}"
                  title="${MOOD_LABELS[level]}"
                  onclick="setMoodDay('${dateStr}', ${level})">
            ${MOOD_LABELS[level]}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  // Events section
  const eventsHTML = `
    <div class="day-section">
      <div class="day-section-header">
        <div class="day-section-title">События</div>
        <button class="day-add-btn" onclick="showAddEvent('${dateStr}')">+</button>
      </div>
      ${dayEvents.length ? dayEvents.map(e => `
        <div class="day-event-row">
          <div class="day-event-color" style="background:${e.color || 'var(--lavender)'}"></div>
          <div class="day-event-info">
            <div class="day-event-title">${e.title}</div>
            ${e.time ? `<div class="day-event-time">${e.time}</div>` : ''}
            ${e.description ? `<div class="day-event-desc">${e.description}</div>` : ''}
          </div>
          <button class="task-delete" onclick="deleteEvent(${e.id}, '${dateStr}')">&times;</button>
        </div>
      `).join('') : '<div class="day-empty">Нет событий</div>'}
    </div>
  `;

  // Tasks section
  const tasksHTML = `
    <div class="day-section">
      <div class="day-section-title">Задачи</div>
      ${dayTasks.length ? dayTasks.map(t => `
        <div class="task-row ${t.status === 'done' ? 'done' : ''}">
          <button class="task-check ${t.status === 'done' ? 'checked' : ''}"
                  onclick="toggleTaskDay(${t.id}, '${t.status}', '${dateStr}')">
            ${t.status === 'done' ? '&#10003;' : ''}
          </button>
          <span class="task-text">${t.title}</span>
        </div>
      `).join('') : '<div class="day-empty">Нет задач на этот день</div>'}
    </div>
  `;

  const notesHTML = `
    <div class="day-section">
      <div class="day-section-title">Заметки дня</div>
      <textarea class="day-notes-textarea" placeholder="Как прошёл день..."
                onblur="saveDayNote('${dateStr}', this.value)">${dayNote?.text || ''}</textarea>
    </div>
  `;

  // 6-Minute Diary
  const diary = dayNote?.diary || {};
  const gr = diary.grateful || ['','',''];
  // Migrate old formats: string → array
  let mg = diary.makeGreat;
  if (typeof mg === 'string') mg = mg ? [mg] : [''];
  if (!Array.isArray(mg) || mg.length === 0) mg = [''];
  let mo = diary.moments;
  if (!Array.isArray(mo) || mo.length === 0) mo = [''];

  function diaryListInputs(field, items) {
    // Always show one extra empty row for adding new items
    const rows = [...items];
    if (rows[rows.length - 1] !== '') rows.push('');
    return rows.map((v, i) =>
      `<input class="diary-input" placeholder="${i + 1}." value="${escDiary(v)}" onblur="saveDiaryListField('${dateStr}','${field}',${i},this.value)">`
    ).join('');
  }

  const diaryHTML = `
    <div class="day-section diary-section">
      <div class="day-section-title">6 минут</div>

      <div class="diary-half diary-morning">
        <div class="diary-half-title diary-morning-title">Утро</div>

        <div class="diary-prompt">За что я благодарна?</div>
        <input class="diary-input" placeholder="1." value="${escDiary(gr[0])}" onblur="saveDiaryField('${dateStr}','grateful',0,this.value)">
        <input class="diary-input" placeholder="2." value="${escDiary(gr[1])}" onblur="saveDiaryField('${dateStr}','grateful',1,this.value)">
        <input class="diary-input" placeholder="3." value="${escDiary(gr[2])}" onblur="saveDiaryField('${dateStr}','grateful',2,this.value)">

        <div class="diary-prompt">Что сделает сегодняшний день замечательным?</div>
        ${diaryListInputs('makeGreat', mg)}

        <div class="diary-prompt">Положительная установка</div>
        <input class="diary-input" placeholder="Я..." value="${escDiary(diary.affirmation)}" onblur="saveDiaryField('${dateStr}','affirmation',null,this.value)">
      </div>

      <div class="diary-divider"></div>

      <div class="diary-half diary-evening">
        <div class="diary-half-title diary-evening-title">Вечер</div>

        <div class="diary-prompt">Что сегодня было сделано хорошего для других?</div>
        <input class="diary-input" placeholder="Я помогла..." value="${escDiary(diary.goodDeed)}" onblur="saveDiaryField('${dateStr}','goodDeed',null,this.value)">

        <div class="diary-prompt">Что я могу сделать завтра лучше?</div>
        <input class="diary-input" placeholder="В следующий раз..." value="${escDiary(diary.couldBetter)}" onblur="saveDiaryField('${dateStr}','couldBetter',null,this.value)">

        <div class="diary-prompt">Прекрасные события, которые произошли со мной сегодня</div>
        ${diaryListInputs('moments', mo)}
      </div>
    </div>
  `;

  container.innerHTML = `
    <div class="page-day">
      <div class="day-header">
        <button class="back-btn" onclick="navigate('calendar', { year: ${year}, month: ${monthIdx} })">&larr;</button>
        <div class="day-header-info">
          <h2>${dayNum} ${MONTH_NAMES[monthIdx]}</h2>
          <div class="day-weekday">${dayOfWeek}</div>
        </div>
      </div>
      ${moodHTML}
      ${diaryHTML}
      ${notesHTML}
      ${eventsHTML}
      ${tasksHTML}
    </div>
  `;
}

function escDiary(v) {
  if (!v) return '';
  return v.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
}

async function saveDayNote(dateStr, text) {
  const existing = await dbGet('daynotes', dateStr) || { date: dateStr };
  existing.text = text.trim() || undefined;
  // Keep record if diary has data, otherwise clean up
  if (existing.text || existing.diary) {
    await dbPut('daynotes', existing);
  } else {
    await dbDelete('daynotes', dateStr);
  }
}

async function saveDiaryField(dateStr, field, index, value) {
  const existing = await dbGet('daynotes', dateStr) || { date: dateStr };
  if (!existing.diary) {
    existing.diary = {
      grateful: ['','',''],
      makeGreat: [''],
      affirmation: '',
      goodDeed: '',
      couldBetter: '',
      moments: ['']
    };
  }
  // Migrate old string makeGreat to array
  if (field === 'makeGreat' && typeof existing.diary.makeGreat === 'string') {
    existing.diary.makeGreat = existing.diary.makeGreat ? [existing.diary.makeGreat] : [''];
  }
  if (index !== null && index !== undefined) {
    existing.diary[field][index] = value.trim();
  } else {
    existing.diary[field] = value.trim();
  }
  await dbPut('daynotes', existing);
}

async function saveDiaryListField(dateStr, field, index, value) {
  const existing = await dbGet('daynotes', dateStr) || { date: dateStr };
  if (!existing.diary) {
    existing.diary = {
      grateful: ['','',''],
      makeGreat: [''],
      affirmation: '',
      goodDeed: '',
      couldBetter: '',
      moments: ['']
    };
  }
  // Migrate old string to array
  if (typeof existing.diary[field] === 'string') {
    existing.diary[field] = existing.diary[field] ? [existing.diary[field]] : [''];
  }
  if (!Array.isArray(existing.diary[field])) existing.diary[field] = [''];

  // Expand array if needed
  while (existing.diary[field].length <= index) existing.diary[field].push('');
  existing.diary[field][index] = value.trim();

  // Trim trailing empty items but keep at least one
  while (existing.diary[field].length > 1 && existing.diary[field][existing.diary[field].length - 1] === '') {
    existing.diary[field].pop();
  }

  await dbPut('daynotes', existing);

  // Re-render if user filled the last row (to show new empty row)
  if (value.trim() !== '') {
    navigate('day', { date: dateStr });
  }
}

async function setMoodDay(dateStr, level) {
  await dbPut('moods', { date: dateStr, level });
  await updateStreak(dateStr);
  navigate('day', { date: dateStr });
}

async function toggleTaskDay(id, currentStatus, dateStr) {
  const task = await dbGet('tasks', id);
  if (task) {
    task.status = currentStatus === 'done' ? 'pending' : 'done';
    await dbPut('tasks', task);
  }
  navigate('day', { date: dateStr });
}

async function deleteEvent(id, dateStr) {
  await dbDelete('events', id);
  navigate('day', { date: dateStr });
}

const EVENT_COLORS = ['#b8a0d8','#e8a0b0','#a8c8a0','#f0c0a0','#f8e8c8','#a0b8d0'];

function showAddEvent(dateStr) {
  const content = document.getElementById('content');
  const colorsHTML = EVENT_COLORS.map((c, i) =>
    `<label class="color-option">
      <input type="radio" name="color" value="${c}" ${i === 0 ? 'checked' : ''}>
      <span class="color-dot" style="background:${c}"></span>
    </label>`
  ).join('');

  content.innerHTML = `
    <div class="page-day">
      <div class="day-header">
        <button class="back-btn" onclick="navigate('day', { date: '${dateStr}' })">&larr;</button>
        <h2>Новое событие</h2>
      </div>
      <form class="cosm-form" onsubmit="saveEvent(event, '${dateStr}')">
        <label class="form-label">Название
          <input type="text" name="title" class="form-input" placeholder="Встреча с подругой" required>
        </label>
        <label class="form-label">Время
          <input type="time" name="time" class="form-input">
        </label>
        <label class="form-label">Место
          <input type="text" name="place" class="form-input" placeholder="Кафе у дома">
        </label>
        <label class="form-label">Описание
          <textarea name="description" class="form-input" rows="3" placeholder="Подробности..."></textarea>
        </label>
        <label class="form-label">Цвет
          <div class="color-picker">${colorsHTML}</div>
        </label>
        <button type="submit" class="form-submit">Сохранить</button>
      </form>
    </div>
  `;
}

async function saveEvent(e, dateStr) {
  e.preventDefault();
  const fd = new FormData(e.target);
  await dbPut('events', {
    date: dateStr,
    title: fd.get('title'),
    time: fd.get('time') || null,
    place: fd.get('place') || null,
    description: fd.get('description') || null,
    color: fd.get('color') || EVENT_COLORS[0],
    createdAt: new Date().toISOString(),
  });
  navigate('day', { date: dateStr });
}

route('day', renderDay);
