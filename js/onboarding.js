// Onboarding — shows once per user on first login

const SLIDES = [
  {
    icon: '&#127807;',
    title: 'Добро пожаловать!',
    text: 'Это твой личный bullet journal — красивый ежедневник прямо в телефоне. Работает офлайн и сохраняется в облако.',
  },
  {
    icon: '&#128197;',
    title: 'Месяцы и дни',
    text: 'На главной — сетка месяцев. Заходи в любой день: добавляй задачи, события, заметки и стикеры.',
  },
  {
    icon: '&#9679;&#9679;&#9679;',
    title: 'Настроение и привычки',
    text: 'Отмечай настроение каждый день — появится красивая картина года. Следи за привычками и streak.',
  },
  {
    icon: '&#9729;',
    title: 'Всё сохраняется',
    text: 'Данные автоматически синхронизируются с облаком. Можно установить приложение на экран телефона.',
    isLast: true,
  },
];

function onboardingKey(userId) {
  return 'bujo-onboarded-' + userId;
}

function needsOnboarding(userId) {
  return !localStorage.getItem(onboardingKey(userId));
}

function markOnboarded(userId) {
  localStorage.setItem(onboardingKey(userId), '1');
}

function showOnboarding(userId, onDone) {
  let current = 0;

  const overlay = document.createElement('div');
  overlay.className = 'onboarding-overlay';
  document.body.appendChild(overlay);

  function render() {
    const slide = SLIDES[current];
    const dots = SLIDES.map((_, i) =>
      `<span class="onboarding-dot ${i === current ? 'active' : ''}"></span>`
    ).join('');

    overlay.innerHTML = `
      <div class="onboarding-card">
        <div class="onboarding-icon">${slide.icon}</div>
        <h2 class="onboarding-title">${slide.title}</h2>
        <p class="onboarding-text">${slide.text}</p>
        <div class="onboarding-dots">${dots}</div>
        <button class="onboarding-btn" id="onboarding-next">
          ${slide.isLast ? 'Начать' : 'Далее'}
        </button>
        ${current > 0 ? `<button class="onboarding-skip" id="onboarding-back">Назад</button>` : ''}
      </div>
    `;

    document.getElementById('onboarding-next').addEventListener('click', () => {
      if (slide.isLast) {
        finish();
      } else {
        current++;
        render();
      }
    });

    const backBtn = document.getElementById('onboarding-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        current--;
        render();
      });
    }
  }

  function finish() {
    markOnboarded(userId);
    overlay.remove();
    onDone();
  }

  render();
}
