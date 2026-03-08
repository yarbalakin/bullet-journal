// Collections — curated lists
const COLLECTIONS_META = [
  { id: 'books',     label: 'Книги',          icon: '&#128218;', doneLabel: 'прочитано' },
  { id: 'wishlist',  label: 'Вишлист',         icon: '&#10024;',  doneLabel: 'куплено' },
  { id: 'gifts',     label: 'Идеи подарков',   icon: '&#127873;', doneLabel: 'подарено' },
  { id: 'braindump', label: 'Мысли',           icon: '&#9997;',   doneLabel: '' },
];

async function renderCollections(container) {
  const data = {};
  for (const c of COLLECTIONS_META) {
    data[c.id] = await dbGet('collections', c.id) || { id: c.id, items: [] };
  }

  const renderCollection = (meta) => {
    const { id, label, icon, doneLabel } = meta;
    const items = data[id].items;
    const doneCount = items.filter(i => i.done).length;

    return `
      <div class="coll-card">
        <div class="coll-card-header">
          <span class="coll-icon">${icon}</span>
          <span class="coll-label">${label}</span>
          ${doneCount ? `<span class="coll-done-count">${doneCount}/${items.length}</span>` : ''}
        </div>
        <ul class="coll-items">
          ${items.map((item, i) => `
            <li class="coll-item ${item.done ? 'done' : ''}">
              <button class="coll-check ${item.done ? 'checked' : ''}"
                      onclick="toggleCollItem('${id}', ${i})">${item.done ? '&#10003;' : ''}</button>
              <span class="coll-item-text">${item.text}</span>
              ${doneLabel && item.done ? `<span class="coll-done-label">${doneLabel}</span>` : ''}
              <button class="coll-delete" onclick="deleteCollItem('${id}', ${i})">&#215;</button>
            </li>
          `).join('')}
          ${!items.length ? '<li class="coll-empty">Пока пусто</li>' : ''}
        </ul>
        <form class="coll-add" onsubmit="addCollItem(event, '${id}')">
          <input class="coll-input" type="text" placeholder="Добавить..." required>
          <button type="submit" class="coll-add-btn">+</button>
        </form>
      </div>
    `;
  };

  container.innerHTML = `
    <div class="page-collections">
      <div class="coll-header">
        <button class="future-back" onclick="navigate('home')">&#8592;</button>
        <h2>Коллекции</h2>
      </div>
      ${COLLECTIONS_META.map(renderCollection).join('')}
    </div>
  `;
}

async function addCollItem(e, collId) {
  e.preventDefault();
  const input = e.target.querySelector('.coll-input');
  const entry = await dbGet('collections', collId) || { id: collId, items: [] };
  entry.items.push({ text: input.value.trim(), done: false });
  await dbPut('collections', entry);
  navigate('collections');
}

async function toggleCollItem(collId, index) {
  const entry = await dbGet('collections', collId);
  if (!entry) return;
  entry.items[index].done = !entry.items[index].done;
  await dbPut('collections', entry);
  navigate('collections');
}

async function deleteCollItem(collId, index) {
  const entry = await dbGet('collections', collId);
  if (!entry) return;
  entry.items.splice(index, 1);
  await dbPut('collections', entry);
  navigate('collections');
}

route('collections', renderCollections);
