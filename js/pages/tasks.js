// Tasks page — monthly task list
async function renderTasks(container, params = {}) {
  const now = new Date();
  const year = params.year ?? now.getFullYear();
  const month = params.month ?? now.getMonth();
  const monthId = `${year}-${String(month + 1).padStart(2, '0')}`;

  // Previous month
  const prevDate = new Date(year, month - 1, 1);
  const prevYear = prevDate.getFullYear();
  const prevMonth = prevDate.getMonth();
  const prevMonthId = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}`;

  // Show migration only when the previous month is already in the past
  const prevMonthIsPast = prevYear < now.getFullYear() ||
    (prevYear === now.getFullYear() && prevMonth < now.getMonth());
  let migrationTasks = [];
  if (prevMonthIsPast) {
    const prevTasks = await dbGetByIndex('tasks', 'monthId', prevMonthId);
    migrationTasks = prevTasks.filter(t => t.status === 'pending');
  }

  const allTasks = await dbGetByIndex('tasks', 'monthId', monthId);
  // Hide migrated/cancelled tasks from display
  const tasks = allTasks.filter(t => t.status !== 'migrated' && t.status !== 'cancelled');

  // Group tasks migrated into this month by their source month
  const migratedIn = tasks.filter(t => t.migratedFrom && t.status !== 'done');
  const migratedInBySource = {};
  for (const t of migratedIn) {
    const src = t.migratedFrom;
    if (!migratedInBySource[src]) migratedInBySource[src] = [];
    migratedInBySource[src].push(t);
  }

  // Regular tasks (not migrated from another month)
  const regularTasks = tasks.filter(t => !t.migratedFrom);

  // Split into pending and done
  const pendingRegular = regularTasks.filter(t => t.status !== 'done');
  const doneTasks = tasks.filter(t => t.status === 'done');

  // Split pending regular into dated and undated
  const dated = pendingRegular.filter(t => t.date).sort((a, b) => a.date.localeCompare(b.date));
  const undated = pendingRegular.filter(t => !t.date);

  // Load events for this month from events store
  const allEvents = await dbGetAll('events');
  const monthEvents = allEvents
    .filter(e => e.date && e.date.startsWith(monthId))
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''));

  const pendingEvents = monthEvents.filter(e => e.status !== 'done');
  const doneEvents = monthEvents.filter(e => e.status === 'done');

  const renderTask = t => `
    <div class="task-row ${t.status === 'done' ? 'done' : ''}" data-id="${t.id}">
      <button class="task-check ${t.status === 'done' ? 'checked' : ''}"
              onclick="toggleTask(${t.id}, '${t.status}', ${year}, ${month})">
        ${t.status === 'done' ? '&#10003;' : ''}
      </button>
      <span class="task-text event-editable" onclick="showEditTaskModal(${t.id}, ${year}, ${month})">${t.title}</span>
      ${t.migrateCount ? `<span class="task-migrate-count">&times;${t.migrateCount}</span>` : ''}
      ${t.date ? `<span class="task-date">${t.date.slice(8)}.${t.date.slice(5,7)}</span>` : ''}
      <button class="task-edit" onclick="showEditTaskModal(${t.id}, ${year}, ${month})" title="Редактировать">&#9998;</button>
      <button class="task-delete" onclick="deleteTask(${t.id}, ${year}, ${month})">&times;</button>
    </div>
  `;

  const renderEvent = e => `
    <div class="task-row ${e.status === 'done' ? 'done' : ''}" data-id="ev-${e.id}">
      <button class="task-check ${e.status === 'done' ? 'checked' : ''}"
              onclick="toggleEvent(${e.id}, '${e.status || 'pending'}', ${year}, ${month})">
        ${e.status === 'done' ? '&#10003;' : ''}
      </button>
      <span class="day-event-color" style="background:${e.color || 'var(--lavender)'}; width:10px; height:10px; border-radius:50%; display:inline-block; margin-right:6px; flex-shrink:0"></span>
      <span class="task-text event-editable" onclick="showEditEventModal(${e.id}, ${year}, ${month})">${e.title}${e.time ? ' · ' + e.time : ''}</span>
      <span class="task-date">${e.date.slice(8)}.${e.date.slice(5,7)}</span>
      <button class="task-edit" onclick="showEditEventModal(${e.id}, ${year}, ${month})" title="Редактировать">&#9998;</button>
      <button class="task-delete" onclick="deleteEventFromTasks(${e.id}, ${year}, ${month})">&times;</button>
    </div>
  `;

  const migrationHTML = migrationTasks.length ? `
    <div class="migration-panel">
      <div class="migration-header">
        <span>&#8594; Перенести из ${MONTH_NAMES[prevMonth]}</span>
        <span class="migration-count">${migrationTasks.length}</span>
      </div>
      ${migrationTasks.map(t => `
        <div class="migration-task">
          <span class="migration-task-text">${t.title}</span>
          <button class="migration-btn migration-btn-migrate" onclick="migrateTask(${t.id}, ${year}, ${month})" title="Перенести">&#8594;</button>
          <button class="migration-btn migration-btn-cancel" onclick="cancelTask(${t.id}, ${year}, ${month})" title="Отменить">&#215;</button>
        </div>
      `).join('')}
    </div>
  ` : '';

  // Build "Перенесено из [месяц]" blocks for each source month
  const migratedInHTML = Object.entries(migratedInBySource)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([srcMonthId, srcTasks]) => {
      const [srcYear, srcMonNum] = srcMonthId.split('-').map(Number);
      const srcMonthName = MONTH_NAMES[srcMonNum - 1];
      return `
        <div class="task-group transferred-group">
          <div class="task-group-label transferred-label">&#8594; Перенесено из ${srcMonthName}</div>
          ${srcTasks.map(renderTask).join('')}
        </div>
      `;
    }).join('');

  const prevNavYear = month === 0 ? year - 1 : year;
  const prevNavMonth = month === 0 ? 11 : month - 1;
  const nextNavYear = month === 11 ? year + 1 : year;
  const nextNavMonth = month === 11 ? 0 : month + 1;

  const totalDone = doneTasks.length + doneEvents.length;
  const totalCount = tasks.length + monthEvents.length;

  const doneHTML = (doneTasks.length || doneEvents.length) ? `
    <div class="task-group">
      <div class="task-group-label">Завершено</div>
      ${doneEvents.map(renderEvent).join('')}
      ${doneTasks.map(renderTask).join('')}
    </div>
  ` : '';

  container.innerHTML = `
    <div class="page-tasks">
      <div class="tasks-header">
        <button class="cal-nav-btn" onclick="navigate('tasks', { year: ${prevNavYear}, month: ${prevNavMonth} })">&#8592;</button>
        <div class="tasks-header-center">
          <h2>${MONTH_NAMES[month]}</h2>
          <span class="tasks-count">${totalDone}/${totalCount}</span>
        </div>
        <button class="cal-nav-btn" onclick="navigate('tasks', { year: ${nextNavYear}, month: ${nextNavMonth} })">&#8594;</button>
      </div>

      <form class="task-add" id="task-form" onsubmit="addTask(event, '${monthId}', ${year}, ${month})">
        <input type="text" class="task-input" id="task-input" placeholder="Новая задача..." required>
        <label class="task-date-label" title="Выбрать дату">
          <input type="date" class="task-date-input" id="task-date-input" onchange="onTaskDateChange(this)">
          <span class="task-date-display" id="task-date-display">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </span>
        </label>
        <button type="button" class="task-add-btn" onclick="showTypeChoice('${monthId}', ${year}, ${month})">+</button>
      </form>

      ${(pendingEvents.length) ? `
        <div class="task-group">
          <div class="task-group-label">События</div>
          ${pendingEvents.map(renderEvent).join('')}
        </div>
      ` : ''}

      ${(dated.length || undated.length) ? `
        <div class="task-group">
          <div class="task-group-label">Задачи</div>
          ${dated.map(renderTask).join('')}
          ${undated.map(renderTask).join('')}
        </div>
      ` : ''}

      ${migratedInHTML}

      ${migrationHTML}

      ${doneHTML}

      ${!tasks.length && !migrationTasks.length && !monthEvents.length ? '<div class="empty-state">Пока нет задач. Добавь первую!</div>' : ''}
    </div>

    <!-- Модальное окно выбора типа -->
    <div class="type-choice-overlay" id="type-choice-overlay" onclick="hideTypeChoice()">
      <div class="type-choice-sheet" onclick="event.stopPropagation()">
        <div class="type-choice-title">Что добавить?</div>
        <div class="type-choice-buttons">
          <button class="type-choice-btn" onclick="chooseTask()">
            <span class="type-choice-icon">&#9633;</span>
            Задача
          </button>
          <button class="type-choice-btn type-choice-btn-event" onclick="chooseEvent('${monthId}', ${year}, ${month})">
            <span class="type-choice-icon">&#11044;</span>
            Событие
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно создания/редактирования события -->
    <div class="event-modal-overlay" id="event-modal-overlay" onclick="hideEventModal()">
      <div class="event-modal" onclick="event.stopPropagation()" id="event-modal-content">
      </div>
    </div>
  `;
}

// ============================================================
// Выбор типа: Задача / Событие
// ============================================================

function showTypeChoice(monthId, year, month) {
  document.getElementById('type-choice-overlay').classList.add('active');
  // Сохраняем параметры для события
  window._taskMonthId = monthId;
  window._taskYear = year;
  window._taskMonth = month;
}

function hideTypeChoice() {
  document.getElementById('type-choice-overlay').classList.remove('active');
}

function chooseTask() {
  hideTypeChoice();
  const input = document.getElementById('task-input');
  if (input) {
    // Если текст уже введён — сабмитим форму
    if (input.value.trim()) {
      document.getElementById('task-form').requestSubmit();
    } else {
      input.focus();
    }
  }
}

function chooseEvent(monthId, year, month) {
  hideTypeChoice();
  // Дата по умолчанию: 1-е число текущего месяца или сегодня если тот же месяц
  const now = new Date();
  const nowMonth = now.getMonth();
  const nowYear = now.getFullYear();
  let defaultDate;
  if (year === nowYear && month === nowMonth) {
    defaultDate = now.toISOString().slice(0, 10);
  } else {
    defaultDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  }
  showEventModal(null, defaultDate, year, month);
}

// ============================================================
// Модальное окно события (создание и редактирование)
// ============================================================

const TASKS_EVENT_COLORS = ['#b8a0d8','#e8a0b0','#a8c8a0','#f0c0a0','#f8e8c8','#a0b8d0'];

function showEventModal(existingEvent, defaultDate, year, month) {
  const isEdit = existingEvent !== null;
  const ev = existingEvent || {};

  const colorsHTML = TASKS_EVENT_COLORS.map((c, i) => {
    const checked = isEdit ? (ev.color === c) : (i === 0);
    return `<label class="color-option">
      <input type="radio" name="color" value="${c}" ${checked ? 'checked' : ''}>
      <span class="color-dot" style="background:${c}"></span>
    </label>`;
  }).join('');

  const dateVal = isEdit ? ev.date : defaultDate;
  const timeVal = isEdit && ev.time ? ev.time : '';
  const placeVal = isEdit && ev.place ? ev.place : '';
  const descVal = isEdit && ev.description ? ev.description : '';
  const titleVal = isEdit ? ev.title : '';

  const onsubmit = isEdit
    ? `updateEventFromTasks(event, ${ev.id}, ${year}, ${month})`
    : `saveEventFromTasks(event, ${year}, ${month})`;

  document.getElementById('event-modal-content').innerHTML = `
    <div class="event-modal-header">
      <h3>${isEdit ? 'Редактировать событие' : 'Новое событие'}</h3>
      <button class="event-modal-close" onclick="hideEventModal()">&times;</button>
    </div>
    <form class="cosm-form event-modal-form" onsubmit="${onsubmit}">
      <label class="form-label">Название
        <input type="text" name="title" class="form-input" placeholder="Встреча с подругой" value="${titleVal}" required>
      </label>
      <label class="form-label">Дата
        <input type="date" name="eventDate" class="form-input" value="${dateVal}" required>
      </label>
      <label class="form-label">Время
        <input type="time" name="time" class="form-input" value="${timeVal}">
      </label>
      <label class="form-label">Место
        <input type="text" name="place" class="form-input" placeholder="Кафе у дома" value="${placeVal}">
      </label>
      <label class="form-label">Описание
        <textarea name="description" class="form-input" rows="2" placeholder="Подробности...">${descVal}</textarea>
      </label>
      <label class="form-label">Цвет
        <div class="color-picker">${colorsHTML}</div>
      </label>
      <button type="submit" class="form-submit">Сохранить</button>
    </form>
  `;

  document.getElementById('event-modal-overlay').classList.add('active');
}

function hideEventModal() {
  document.getElementById('event-modal-overlay').classList.remove('active');
}

async function showEditEventModal(id, year, month) {
  const ev = await dbGet('events', id);
  if (!ev) return;
  showEventModal(ev, ev.date, year, month);
}

// ============================================================
// Модальное окно редактирования задачи
// ============================================================

async function showEditTaskModal(id, year, month) {
  const task = await dbGet('tasks', id);
  if (!task) return;

  document.getElementById('event-modal-content').innerHTML = `
    <div class="event-modal-header">
      <h3>Редактировать задачу</h3>
      <button class="event-modal-close" onclick="hideEventModal()">&times;</button>
    </div>
    <form class="cosm-form event-modal-form" onsubmit="updateTaskFromModal(event, ${id}, ${year}, ${month})">
      <label class="form-label">Название
        <input type="text" name="title" class="form-input" value="${task.title.replace(/"/g, '&quot;')}" required>
      </label>
      <label class="form-label">Дата (необязательно)
        <input type="date" name="date" class="form-input" value="${task.date || ''}">
      </label>
      <button type="submit" class="form-submit">Сохранить</button>
    </form>
  `;

  document.getElementById('event-modal-overlay').classList.add('active');
}

async function updateTaskFromModal(e, id, year, month) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const task = await dbGet('tasks', id);
  if (!task) return;
  task.title = fd.get('title').trim();
  task.date = fd.get('date') || null;
  await dbPut('tasks', task);
  hideEventModal();
  navigate('tasks', { year, month });
}

async function saveEventFromTasks(e, year, month) {
  e.preventDefault();
  const fd = new FormData(e.target);
  await dbPut('events', {
    date: fd.get('eventDate'),
    title: fd.get('title'),
    time: fd.get('time') || null,
    place: fd.get('place') || null,
    description: fd.get('description') || null,
    color: fd.get('color') || TASKS_EVENT_COLORS[0],
    status: 'pending',
    createdAt: new Date().toISOString(),
  });
  hideEventModal();
  navigate('tasks', { year, month });
}

async function updateEventFromTasks(e, id, year, month) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const existing = await dbGet('events', id);
  if (!existing) return;
  await dbPut('events', {
    ...existing,
    date: fd.get('eventDate'),
    title: fd.get('title'),
    time: fd.get('time') || null,
    place: fd.get('place') || null,
    description: fd.get('description') || null,
    color: fd.get('color') || TASKS_EVENT_COLORS[0],
  });
  hideEventModal();
  navigate('tasks', { year, month });
}

// ============================================================
// Существующие функции
// ============================================================

async function addTask(e, monthId, year, month) {
  e.preventDefault();
  const input = e.target.querySelector('.task-input');
  const dateInput = e.target.querySelector('.task-date-input');
  await dbPut('tasks', {
    monthId,
    title: input.value.trim(),
    date: dateInput.value || null,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });
  navigate('tasks', { year, month });
}

async function toggleTask(id, currentStatus, year, month) {
  const task = await dbGet('tasks', id);
  if (task) {
    task.status = currentStatus === 'done' ? 'pending' : 'done';
    await dbPut('tasks', task);
  }
  navigate('tasks', { year, month });
}

async function toggleEvent(id, currentStatus, year, month) {
  const ev = await dbGet('events', id);
  if (ev) {
    ev.status = currentStatus === 'done' ? 'pending' : 'done';
    await dbPut('events', ev);
  }
  navigate('tasks', { year, month });
}

async function deleteTask(id, year, month) {
  await dbDelete('tasks', id);
  navigate('tasks', { year, month });
}

async function migrateTask(id, toYear, toMonth) {
  const task = await dbGet('tasks', id);
  if (!task) return;
  // Mark original as migrated
  task.status = 'migrated';
  await dbPut('tasks', task);
  // Create copy in target month, incrementing the transfer counter
  const toMonthId = `${toYear}-${String(toMonth + 1).padStart(2, '0')}`;
  await dbPut('tasks', {
    monthId: toMonthId,
    title: task.title,
    date: null,
    status: 'pending',
    createdAt: new Date().toISOString(),
    migratedFrom: task.monthId,
    migrateCount: (task.migrateCount || 0) + 1,
  });
  navigate('tasks', { year: toYear, month: toMonth });
}

async function cancelTask(id, toYear, toMonth) {
  const task = await dbGet('tasks', id);
  if (!task) return;
  task.status = 'cancelled';
  await dbPut('tasks', task);
  navigate('tasks', { year: toYear, month: toMonth });
}

async function deleteEventFromTasks(id, year, month) {
  await dbDelete('events', id);
  navigate('tasks', { year, month });
}

function onTaskDateChange(input) {
  const display = document.getElementById('task-date-display');
  if (!display) return;
  if (input.value) {
    const [y, m, d] = input.value.split('-').map(Number);
    const months = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
    display.textContent = `${d} ${months[m - 1]}`;
    display.classList.add('has-date');
  } else {
    display.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
    display.classList.remove('has-date');
  }
}

route('tasks', renderTasks);
