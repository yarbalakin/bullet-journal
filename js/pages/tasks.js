// Tasks page — monthly task list
async function renderTasks(container, params = {}) {
  const now = new Date();
  const year = params.year ?? now.getFullYear();
  const month = params.month ?? now.getMonth();
  const monthId = `${year}-${String(month + 1).padStart(2, '0')}`;

  const tasks = await dbGetByIndex('tasks', 'monthId', monthId);

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

  container.innerHTML = `
    <div class="page-tasks">
      <div class="tasks-header">
        <h2>${MONTH_NAMES[month]}</h2>
        <span class="tasks-count">${tasks.filter(t=>t.status==='done').length}/${tasks.length}</span>
      </div>

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

      ${!tasks.length ? '<div class="empty-state">Пока нет задач. Добавь первую!</div>' : ''}
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

route('tasks', renderTasks);
