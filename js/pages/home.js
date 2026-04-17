// Home page — month covers grid
const MONTH_NAMES = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

const COVER_IMAGES = [
  'images/covers/01-january.jpg',
  'images/covers/02-february.jpg',
  'images/covers/03-march.jpg',
  'images/covers/04-april.jpg',
  'images/covers/05-may.jpg',
  'images/covers/06-june.jpg',
  'images/covers/07-july.jpg',
  'images/covers/08-august.jpg',
  'images/covers/09-september.jpg',
  'images/covers/10-october.jpg',
  'images/covers/11-november.jpg',
  'images/covers/12-december.jpg',
];

const COVER_GRADIENTS = [
  ['#e8c0c8','#f0d8d0'],
  ['#d0c0e0','#e8d0e8'],
  ['#c0d8c0','#d8e8c8'],
  ['#f0d8b8','#f8e8d0'],
  ['#c8d8b8','#e0ecd0'],
  ['#e8c8d0','#f8dce0'],
  ['#d0e0c8','#e8f0d8'],
  ['#f0c8a8','#f8e0c8'],
  ['#d8c8a8','#e8dcc0'],
  ['#c8a890','#d8c0a8'],
  ['#b8a8c0','#d0c0d8'],
  ['#a8b8c8','#c8d0d8'],
];

async function renderHome(container) {
  const now = new Date();
  const year = now.getFullYear();
  const currentMonth = now.getMonth();

  // Get streak data
  const streak = await dbGet('streak', 'main') || { current: 0, longest: 0 };
  const milestones = [
    { days: 7,   label: '7 дней',   icon: '&#9733;' },
    { days: 30,  label: '30 дней',  icon: '&#9733;&#9733;' },
    { days: 100, label: '100 дней', icon: '&#9733;&#9733;&#9733;' },
    { days: 365, label: '1 год',    icon: '&#9752;' },
  ];
  const badgesHTML = milestones.map(m => {
    const earned = streak.longest >= m.days;
    return `<span class="streak-badge ${earned ? 'earned' : ''}" title="${m.label}">${m.icon}</span>`;
  }).join('');

  // Load custom covers
  const allMonths = await dbGetAll('months');
  const monthCovers = {};
  allMonths.forEach(m => { if (m.coverIndex !== undefined) monthCovers[m.id] = m.coverIndex; });

  container.innerHTML = `
    <div class="page-home">
      <div class="home-header">
        <h1 class="home-title">${year}</h1>
        <div class="home-streak" title="Дней подряд">
          <span class="streak-flame">&#10045;</span>
          <span class="streak-count">${streak.current || 0}</span>
        </div>
      </div>
      ${badgesHTML ? `<div class="streak-badges">${badgesHTML}<span class="streak-best">рекорд: ${streak.longest || 0}</span></div>` : ''}
      <div class="months-grid">
        ${MONTH_NAMES.map((name, i) => {
          const isCurrent = i === currentMonth;
          const isPast = i < currentMonth;
          const grad = COVER_GRADIENTS[i];
          const monthId = `${year}-${String(i + 1).padStart(2, '0')}`;
          const coverIdx = monthCovers[monthId] !== undefined ? monthCovers[monthId] : i;
          const img = COVER_IMAGES[coverIdx];
          return `
            <div class="month-card ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}"
                 onclick="navigate('calendar', { year: ${year}, month: ${i} })"
                 style="background: linear-gradient(135deg, ${grad[0]}, ${grad[1]}); background-image: url('${img}'); background-size: cover; background-position: center">
              <div class="month-card-name">${name}</div>
              ${isCurrent ? '<div class="month-card-badge">сейчас</div>' : ''}
              <button class="month-cover-btn" onclick="event.stopPropagation(); navigate('coverPicker', { year: ${year}, month: ${i} })">&#10000;</button>
            </div>
          `;
        }).join('')}
      </div>
      <div class="home-nav-section">
        <div class="home-nav-grid">
          <div class="home-nav-item" onclick="navigate('habits', { year: ${year}, month: ${currentMonth} })">
            <span class="home-nav-icon">&#9679;&#9679;</span>
            <span>Привычки</span>
          </div>
          <div class="home-nav-item" onclick="navigate('pixels')">
            <span class="home-nav-icon">&#9632;</span>
            <span>Год в пикселях</span>
          </div>
          <div class="home-nav-item" onclick="navigate('future')">
            <span class="home-nav-icon">&#8594;</span>
            <span>Future Log</span>
          </div>
          <div class="home-nav-item" onclick="navigate('collections')">
            <span class="home-nav-icon">&#9733;</span>
            <span>Коллекции</span>
          </div>
          <div class="home-nav-item" onclick="navigate('diary')">
            <span class="home-nav-icon">&#9998;</span>
            <span>Дневник</span>
          </div>
        </div>
        <div class="home-sync-row">
          <button class="home-sync-btn" onclick="syncToCloud()">&#9729; Сохранить в облако</button>
          <button class="home-sync-btn secondary" onclick="restoreFromCloud()">&#8635; Восстановить</button>
          <button class="home-sync-btn secondary" onclick="exportData()">&#8675; JSON-бэкап</button>
          <button class="home-sync-btn secondary" onclick="updateApp()">&#8593; Обновить приложение</button>
          <button class="home-sync-btn secondary" onclick="openLockSettings(getCurrentUser()?.id)">&#9679;&#9679;&#9679;&#9679; Защита</button>
        </div>
        <div class="home-version">${APP_VERSION}</div>
      </div>
    </div>
  `;
}

route('home', renderHome);
