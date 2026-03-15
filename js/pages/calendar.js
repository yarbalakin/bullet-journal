// Calendar page — month grid with mood colors
const MOOD_COLORS = {
  5: '#f0a050', // счастливый день — оранжевый
  4: '#88b888', // спокойно — зелёный
  3: '#70a8d0', // грустно — голубой
  2: '#9878b8', // тревожно — фиолетовый
  1: '#484848', // плохо — чёрный
};

const MOOD_LABELS = {
  5: 'Счастливый день',
  4: 'Спокойно',
  3: 'Грустно',
  2: 'Тревожно',
  1: 'Плохо',
};

const DAY_NAMES = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

async function renderCalendar(container, params = {}) {
  const now = new Date();
  const year = params.year ?? now.getFullYear();
  const month = params.month ?? now.getMonth();
  const monthId = `${year}-${String(month + 1).padStart(2, '0')}`;

  // Get moods for this month
  const allMoods = await dbGetAll('moods');
  const monthMoods = {};
  const monthMoodsList = [];
  allMoods.forEach(m => {
    if (m.date.startsWith(monthId)) {
      monthMoods[m.date] = m;
      monthMoodsList.push(m);
    }
  });

  // Get events for this month
  const allEvents = await dbGetAll('events');
  const monthEvents = {};
  allEvents.forEach(e => {
    if (e.date.startsWith(monthId)) {
      if (!monthEvents[e.date]) monthEvents[e.date] = [];
      monthEvents[e.date].push(e);
    }
  });

  // Get tasks for this month (ALL statuses for summary)
  const allTasks = await dbGetByIndex('tasks', 'monthId', monthId);
  const dayTasks = {};
  allTasks.forEach(t => {
    if (t.date) {
      if (!dayTasks[t.date]) dayTasks[t.date] = [];
      dayTasks[t.date].push(t);
    }
  });

  // Calendar grid
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = lastDay.getDate();
  const today = now.getDate();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  let daysHTML = DAY_NAMES.map(d => `<div class="cal-header">${d}</div>`).join('');

  // Empty cells before first day
  for (let i = 0; i < startDow; i++) {
    daysHTML += '<div class="cal-day empty"></div>';
  }

  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${monthId}-${String(d).padStart(2, '0')}`;
    const mood = monthMoods[dateStr];
    const events = monthEvents[dateStr] || [];
    const tasks = dayTasks[dateStr] || [];
    const isToday = isCurrentMonth && d === today;
    const moodBg = mood ? MOOD_COLORS[mood.level] : '';
    const dots = [];
    if (events.length) dots.push('<span class="cal-dot event-dot"></span>');
    if (tasks.length) dots.push('<span class="cal-dot task-dot"></span>');

    daysHTML += `
      <div class="cal-day ${isToday ? 'today' : ''} ${mood ? 'has-mood' : ''}"
           style="${moodBg ? `background:${moodBg}` : ''}"
           onclick="navigate('day', { date: '${dateStr}' })">
        <span class="cal-day-num">${d}</span>
        ${dots.length ? `<div class="cal-dots">${dots.join('')}</div>` : ''}
      </div>
    `;
  }

  const coverImg = COVER_IMAGES[month];

  // ── Mood summary ──
  let moodSummaryHTML = '';
  if (monthMoodsList.length > 0) {
    const moodCounts = {5:0, 4:0, 3:0, 2:0, 1:0};
    monthMoodsList.forEach(m => { moodCounts[m.level]++; });
    const totalMoods = monthMoodsList.length;

    moodSummaryHTML = `
      <div class="summary-card">
        <div class="summary-title">Настроение за месяц</div>
        <div class="summary-bars">
          ${[5,4,3,2,1].map(level => {
            const count = moodCounts[level];
            const pct = totalMoods ? Math.round(count / totalMoods * 100) : 0;
            return `<div class="summary-bar-row">
              <span class="summary-bar-label" style="color:${MOOD_COLORS[level]}">${MOOD_LABELS[level]}</span>
              <div class="summary-bar-track">
                <div class="summary-bar-fill" style="width:${pct}%;background:${MOOD_COLORS[level]}"></div>
              </div>
              <span class="summary-bar-count">${count}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  // ── Task summary ──
  let taskSummaryHTML = '';
  const tasksDone = allTasks.filter(t => t.status === 'done').length;
  const tasksPending = allTasks.filter(t => t.status === 'pending').length;
  const tasksMigrated = allTasks.filter(t => t.status === 'migrated').length;
  const tasksCancelled = allTasks.filter(t => t.status === 'cancelled').length;
  const tasksTotal = allTasks.length;

  if (tasksTotal > 0) {
    const donePct = Math.round(tasksDone / tasksTotal * 100);
    taskSummaryHTML = `
      <div class="summary-card">
        <div class="summary-title">Задачи за месяц</div>
        <div class="summary-tasks-ring">
          <div class="summary-ring-visual">
            <svg viewBox="0 0 36 36" class="summary-ring-svg">
              <path class="summary-ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path class="summary-ring-fill" stroke-dasharray="${donePct}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span class="summary-ring-text">${donePct}%</span>
          </div>
          <div class="summary-tasks-list">
            <div class="summary-task-stat">
              <span class="summary-stat-dot done"></span>
              <span>Выполнено</span>
              <strong>${tasksDone}</strong>
            </div>
            <div class="summary-task-stat">
              <span class="summary-stat-dot pending"></span>
              <span>Ожидает</span>
              <strong>${tasksPending}</strong>
            </div>
            <div class="summary-task-stat">
              <span class="summary-stat-dot migrated"></span>
              <span>Перенесено</span>
              <strong>${tasksMigrated}</strong>
            </div>
            <div class="summary-task-stat">
              <span class="summary-stat-dot cancelled"></span>
              <span>Отменено</span>
              <strong>${tasksCancelled}</strong>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="page-calendar">
      <div class="cal-bg" style="background-image: url('${coverImg}')"></div>
      <div class="cal-nav">
        <button class="cal-nav-btn" onclick="navigate('calendar', { year: ${month === 0 ? year - 1 : year}, month: ${month === 0 ? 11 : month - 1} })">&larr;</button>
        <h2 class="cal-month-title" onclick="navigate('home')">${MONTH_NAMES[month]} ${year}</h2>
        <button class="cal-nav-btn" onclick="navigate('calendar', { year: ${month === 11 ? year + 1 : year}, month: ${month === 11 ? 0 : month + 1} })">&rarr;</button>
      </div>

      <div class="cal-grid">${daysHTML}</div>

      <div class="mood-picker-section">
        <p class="mood-picker-label">Настроение сегодня:</p>
        <div class="mood-picker">
          ${[1,2,3,4,5].map(level => {
            const todayStr = `${year}-${String(month+1).padStart(2,'0')}-${String(today).padStart(2,'0')}`;
            const isActive = monthMoods[todayStr]?.level === level;
            return `<button class="mood-btn ${isActive ? 'active' : ''}"
                            style="background:${MOOD_COLORS[level]}"
                            title="${MOOD_LABELS[level]}"
                            onclick="setMood('${todayStr}', ${level}, ${year}, ${month})">
                      ${MOOD_LABELS[level]}
                    </button>`;
          }).join('')}
        </div>
      </div>

      <div class="mood-legend">
        ${[5,4,3,2,1].map(l => `<span class="legend-item"><span class="legend-dot" style="background:${MOOD_COLORS[l]}"></span>${MOOD_LABELS[l]}</span>`).join('')}
      </div>

      ${moodSummaryHTML}
      ${taskSummaryHTML}
    </div>
  `;
}

async function setMood(dateStr, level, year, month) {
  await dbPut('moods', { date: dateStr, level });
  await updateStreak(dateStr);
  navigate('calendar', { year, month });
}

async function updateStreak(dateStr) {
  const streak = await dbGet('streak', 'main') || { id: 'main', current: 0, longest: 0, lastDate: null };
  const today = dateStr;
  const yesterday = new Date(dateStr);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (streak.lastDate === today) return; // Already counted today

  if (streak.lastDate === yesterdayStr) {
    streak.current++;
  } else if (streak.lastDate !== today) {
    streak.current = 1;
  }

  streak.lastDate = today;
  if (streak.current > streak.longest) streak.longest = streak.current;
  await dbPut('streak', streak);
}

route('calendar', renderCalendar);
