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

  // Split into dated and undated
  const dated = tasks.filter(t => t.date).sort((a, b) => a.date.localeCompare(b.date));
  const undated = tasks.filter(t => !t.date);

  const renderTask = t => `
    <div class="task-row ${t.status === 'done' ? 'done' : ''}" data-id="${t.id}">
      <button class="task-check ${t.status === 'done' ? 'checked' : ''}"
              onclick="toggleTask(${t.id}, '${t.status}', ${year}, ${month})">
        ${t.status === 'done' ? '&#10003;' : ''}
      </button>
      <span class="task-text">${t.title}</span>
      ${t.date ? `<span class="task-date">${t.date.slice(8)}.${t.date.slice(5,7)}</span>` : ''}
      <button class="task-delete" onclick="deleteTask(${t.id}, ${year}, ${month})">&times;</button>
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

  const prevNavYear = month === 0 ? year - 1 : year;
  const prevNavMonth = month === 0 ? 11 : month - 1;
  const nextNavYear = month === 11 ? year + 1 : year;
  const nextNavMonth = month === 11 ? 0 : month + 1;

  container.innerHTML = `
    <div class="page-tasks">
      <div class="tasks-header">
        <button class="cal-nav-btn" onclick="navigate('tasks', { year: ${prevNavYear}, month: ${prevNavMonth} })">&#8592;</button>
        <div class="tasks-header-center">
          <h2>${MONTH_NAMES[month]}</h2>
          <span class="tasks-count">${tasks.filter(t=>t.status==='done').length}/${tasks.length}</span>
        </div>
        <button class="cal-nav-btn" onclick="navigate('tasks', { year: ${nextNavYear}, month: ${nextNavMonth} })">&#8594;</button>
      </div>

      ${migrationHTML}

      <form class="task-add" onsubmit="addTask(event, '${monthId}', ${year}, ${month})">
        <input type="text" class="task-input" placeholder="Новая задача..." required>
        <input type="date" class="task-date-input">
        <button type="submit" class="task-add-btn">+</button>
      </form>

      ${dated.length ? `
        <div class="task-group">
          <div class="task-group-label">С датой</div>
          ${dated.map(renderTask).join('')}
        </div>
      ` : ''}

      ${undated.length ? `
        <div class="task-group">
          <div class="task-group-label">Без даты</div>
          ${undated.map(renderTask).join('')}
        </div>
      ` : ''}

      ${!tasks.length && !migrationTasks.length ? '<div class="empty-state">Пока нет задач. Добавь первую!</div>' : ''}
    </div>
  `;
}

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
  // Create copy in target month
  const toMonthId = `${toYear}-${String(toMonth + 1).padStart(2, '0')}`;
  await dbPut('tasks', {
    monthId: toMonthId,
    title: task.title,
    date: null,
    status: 'pending',
    createdAt: new Date().toISOString(),
    migratedFrom: task.monthId,
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

route('tasks', renderTasks);
