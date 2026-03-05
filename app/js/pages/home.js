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

  container.innerHTML = `
    <div class="page-home">
      <div class="home-header">
        <h1 class="home-title">${year}</h1>
        <div class="home-streak" title="Дней подряд">
          <span class="streak-flame">&#10045;</span>
          <span class="streak-count">${streak.current || 0}</span>
        </div>
      </div>
      <div class="months-grid">
        ${MONTH_NAMES.map((name, i) => {
          const isCurrent = i === currentMonth;
          const isPast = i < currentMonth;
          const grad = COVER_GRADIENTS[i];
          const img = COVER_IMAGES[i];
          return `
            <div class="month-card ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}"
                 onclick="navigate('calendar', { year: ${year}, month: ${i} })"
                 style="background: linear-gradient(135deg, ${grad[0]}, ${grad[1]}); background-image: url('${img}'); background-size: cover; background-position: center">
              <div class="month-card-name">${name}</div>
              ${isCurrent ? '<div class="month-card-badge">сейчас</div>' : ''}
            </div>
          `;
        }).join('')}
      </div>
      <div class="home-pixels-link" onclick="navigate('pixels')">
        Year in Pixels ${year}
      </div>
      <div class="home-pixels-link" onclick="syncToCloud()" style="margin-top:10px; font-size:13px;">
        Сохранить в облако
      </div>
      <div class="home-pixels-link" onclick="restoreFromCloud()" style="margin-top:8px; font-size:13px; color:var(--text3)">
        Восстановить из облака
      </div>
      <div class="home-pixels-link" onclick="exportData()" style="margin-top:8px; font-size:12px; color:var(--text3)">
        Скачать JSON-бэкап
      </div>
    </div>
  `;
}

route('home', renderHome);
