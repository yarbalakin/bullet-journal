// Future Log — 6-month planner
async function renderFuture(container) {
  const now = new Date();

  // Build list of 6 months starting from current
  const months = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() });
  }

  // Load all future log entries
  const logs = {};
  for (const { year, month } of months) {
    const id = `${year}-${String(month + 1).padStart(2, '0')}`;
    logs[id] = await dbGet('futurelog', id) || { id, items: [] };
  }

  const renderMonth = ({ year, month }) => {
    const id = `${year}-${String(month + 1).padStart(2, '0')}`;
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
    const items = logs[id].items;
    return `
      <div class="future-month ${isCurrentMonth ? 'future-month-current' : ''}">
        <div class="future-month-name">
          ${MONTH_NAMES[month]}${year !== now.getFullYear() ? ' ' + year : ''}
          ${isCurrentMonth ? '<span class="future-month-now">сейчас</span>' : ''}
        </div>
        <ul class="future-items">
          ${items.map((item, i) => `
            <li class="future-item">
              <span class="future-item-dot">&#183;</span>
              <span class="future-item-text">${item}</span>
              <button class="future-delete" onclick="deleteFutureItem('${id}', ${i})">&#215;</button>
            </li>
          `).join('')}
          ${!items.length ? '<li class="future-empty">Пока пусто</li>' : ''}
        </ul>
        <form class="future-add" onsubmit="addFutureItem(event, '${id}')">
          <input class="future-input" type="text" placeholder="Добавить план..." required>
          <button type="submit" class="future-add-btn">+</button>
        </form>
      </div>
    `;
  };

  container.innerHTML = `
    <div class="page-future">
      <div class="future-header">
        <button class="future-back" onclick="navigate('home')">&#8592;</button>
        <h2>Future Log</h2>
      </div>
      ${months.map(renderMonth).join('')}
    </div>
  `;
}

async function addFutureItem(e, monthId) {
  e.preventDefault();
  const input = e.target.querySelector('.future-input');
  const entry = await dbGet('futurelog', monthId) || { id: monthId, items: [] };
  entry.items.push(input.value.trim());
  await dbPut('futurelog', entry);
  navigate('future');
}

async function deleteFutureItem(monthId, index) {
  const entry = await dbGet('futurelog', monthId);
  if (!entry) return;
  entry.items.splice(index, 1);
  await dbPut('futurelog', entry);
  navigate('future');
}

route('future', renderFuture);
