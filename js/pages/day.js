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
      ${eventsHTML}
      ${tasksHTML}
    </div>
  `;
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
