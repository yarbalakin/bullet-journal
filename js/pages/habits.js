// Habit Tracker page — monthly grid
const HABIT_COLORS = ['#e8a0b0','#b8a0d8','#a8c8a0','#f0c0a0','#70a8d0','#f8e0c8','#c8d8b8','#d0c0e0'];

async function renderHabits(container, params = {}) {
  const now = new Date();
  const year = params.year ?? now.getFullYear();
  const month = params.month ?? now.getMonth();
  const monthId = `${year}-${String(month + 1).padStart(2, '0')}`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const meta = await dbGet('habits', 'meta') || { id: 'meta', items: [] };
  const log = await dbGet('habits', monthId) || { id: monthId, checks: {} };

  const prevYear = month === 0 ? year - 1 : year;
  const prevMonth = month === 0 ? 11 : month - 1;
  const nextYear = month === 11 ? year + 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;

  // Day numbers header (abbreviated: 1,5,10,15,20,25,last — or all if ≤20)
  const dayHeaders = Array.from({length: daysInMonth}, (_, i) => i + 1);

  const habitsHTML = meta.items.length ? meta.items.map((h, hi) => {
    const checked = log.checks[String(hi)] || [];
    const cells = dayHeaders.map(d => {
      const isDone = checked.includes(d);
      return `<button class="habit-cell ${isDone ? 'done' : ''}"
                      style="${isDone ? `background:${h.color}` : ''}"
                      onclick="toggleHabitDay('${monthId}', ${hi}, ${d}, this)"></button>`;
    }).join('');
    return `
      <div class="habit-row">
        <div class="habit-name-col">
          <span class="habit-dot" style="background:${h.color}"></span>
          <span class="habit-name">${h.name}</span>
          <button class="habit-delete" onclick="deleteHabit(${hi})">&#215;</button>
        </div>
        <div class="habit-cells">${cells}</div>
      </div>
    `;
  }).join('') : '<div class="habits-empty">Добавь первую привычку ниже</div>';

  container.innerHTML = `
    <div class="page-habits">
      <div class="habits-header">
        <button class="future-back" onclick="navigate('home')">&#8592;</button>
        <button class="cal-nav-btn" onclick="navigate('habits', { year: ${prevYear}, month: ${prevMonth} })">&#8592;</button>
        <h2>${MONTH_NAMES[month]} ${year}</h2>
        <button class="cal-nav-btn" onclick="navigate('habits', { year: ${nextYear}, month: ${nextMonth} })">&#8594;</button>
      </div>
      <div class="habits-scroll">
        <div class="habits-scroll-inner">
          <div class="habit-day-labels">
            <div class="habit-name-col-empty"></div>
            <div class="habit-cells">
              ${dayHeaders.map(d => `<span class="habit-day-num">${d}</span>`).join('')}
            </div>
          </div>
          <div class="habits-list">${habitsHTML}</div>
        </div>
      </div>
      <form class="habit-add-form" onsubmit="addHabit(event)">
        <input class="habit-add-input" type="text" placeholder="Новая привычка..." required>
        <div class="habit-color-picker">
          ${HABIT_COLORS.map((c, i) =>
            `<label class="habit-color-opt">
              <input type="radio" name="hcolor" value="${c}" ${i === 0 ? 'checked' : ''}>
              <span class="habit-color-dot" style="background:${c}"></span>
            </label>`
          ).join('')}
        </div>
        <button type="submit" class="habit-add-btn">+ Добавить</button>
      </form>
    </div>
  `;
}

async function toggleHabitDay(monthId, habitIdx, day, btn) {
  const log = await dbGet('habits', monthId) || { id: monthId, checks: {} };
  const key = String(habitIdx);
  const arr = log.checks[key] || [];
  const pos = arr.indexOf(day);
  if (pos >= 0) {
    arr.splice(pos, 1);
    if (btn) { btn.classList.remove('done'); btn.style.background = ''; }
  } else {
    arr.push(day);
    if (btn) {
      btn.classList.add('done');
      const meta = await dbGet('habits', 'meta') || { id: 'meta', items: [] };
      const color = meta.items[habitIdx]?.color || '';
      btn.style.background = color;
    }
  }
  log.checks[key] = arr;
  await dbPut('habits', log);
}

async function addHabit(e) {
  e.preventDefault();
  const input = e.target.querySelector('.habit-add-input');
  const color = e.target.querySelector('input[name="hcolor"]:checked')?.value || HABIT_COLORS[0];
  const meta = await dbGet('habits', 'meta') || { id: 'meta', items: [] };
  meta.items.push({ name: input.value.trim(), color });
  await dbPut('habits', meta);
  const now = new Date();
  navigate('habits', { year: now.getFullYear(), month: now.getMonth() });
}

async function deleteHabit(index) {
  const meta = await dbGet('habits', 'meta');
  if (!meta) return;
  meta.items.splice(index, 1);
  await dbPut('habits', meta);
  const now = new Date();
  navigate('habits', { year: now.getFullYear(), month: now.getMonth() });
}

route('habits', renderHabits);
