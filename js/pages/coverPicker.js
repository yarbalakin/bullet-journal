// Cover Picker — choose a cover image for a month
async function renderCoverPicker(container, params = {}) {
  const year = params.year ?? new Date().getFullYear();
  const month = params.month ?? new Date().getMonth();
  const monthId = `${year}-${String(month + 1).padStart(2, '0')}`;

  const monthData = await dbGet('months', monthId) || { id: monthId };
  const currentIdx = monthData.coverIndex !== undefined ? monthData.coverIndex : month;

  container.innerHTML = `
    <div class="page-cover-picker">
      <div class="cover-picker-header">
        <button class="future-back" onclick="navigate('home')">&#8592;</button>
        <h2>Обложка — ${MONTH_NAMES[month]}</h2>
      </div>
      <div class="cover-picker-grid">
        ${COVER_IMAGES.map((img, i) => `
          <div class="cover-option ${i === currentIdx ? 'selected' : ''}"
               onclick="pickCover('${monthId}', ${i}, ${year}, ${month})">
            <img src="${img}" alt="${MONTH_NAMES[i]}" loading="lazy">
            <span class="cover-option-label">${MONTH_NAMES[i]}</span>
            ${i === currentIdx ? '<span class="cover-option-check">&#10003;</span>' : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

async function pickCover(monthId, coverIndex, year, month) {
  const monthData = await dbGet('months', monthId) || { id: monthId };
  monthData.coverIndex = coverIndex;
  await dbPut('months', monthData);
  navigate('home');
}

route('coverPicker', renderCoverPicker);
