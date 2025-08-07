// === Переключение языка ===
function switchLanguage(lang) {
  document.documentElement.lang = lang;

  // Заголовки разделов
  document.querySelectorAll('.section-title').forEach(title => {
    if (title.dataset[lang]) title.textContent = title.dataset[lang];
  });

  // Метки
  document.querySelectorAll('.check-label').forEach(label => {
    if (label.dataset[lang]) label.textContent = label.dataset[lang];
  });

  // Опции селекторов
  document.querySelectorAll('select').forEach(select => {
    Array.from(select.options).forEach(option => {
      if (option.dataset[lang]) option.textContent = option.dataset[lang];
    });
  });

  // Обновить текст пустых опций
  document.querySelectorAll('select.qty').forEach(select => {
    const emptyOption = select.querySelector('option[value=""]');
    if (emptyOption) {
      emptyOption.textContent = lang === 'en' ? '— Not selected —' : '— Не выбрано —';
    }
  });
}

// === DOMContentLoaded ===
document.addEventListener('DOMContentLoaded', () => {
  const lang = document.documentElement.lang || 'ru';

  // === Вставка пустых опций ===
  document.querySelectorAll('select.qty').forEach(select => {
    const hasEmpty = Array.from(select.options).some(opt => opt.value === '');
    if (!hasEmpty) {
      const emptyOption = document.createElement('option');
      emptyOption.value = '';
      emptyOption.dataset.ru = '— Не выбрано —';
      emptyOption.dataset.en = '— Not selected —';
      emptyOption.textContent = lang === 'en' ? '— Not selected —' : '— Не выбрано —';
      select.insertBefore(emptyOption, select.firstChild);
    }
  });

  // === Применение языка после вставки опций ===
  switchLanguage(lang);

  // === Установка текущей даты ===
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const formattedDate = `${day}/${month}`;
  const dateDiv = document.getElementById('autodate');
  if (dateDiv) dateDiv.textContent = formattedDate;

  // === Отправка в Telegram ===
  const button = document.getElementById('sendToTelegram');
  button.addEventListener('click', () => {
    const currentLang = document.documentElement.lang || 'ru';
    let message = `🧾 <b>Чеклист</b>\n\n`;

    // Дата
    const dateLine = currentLang === 'en'
      ? `📅 Date: ${formattedDate}`
      : `📅 Дата: ${formattedDate}`;
    message += `${dateLine}\n`;

    // Имя
    const nameSelect = document.querySelector('select[name="chef"]');
    const selectedChef = nameSelect?.options[nameSelect.selectedIndex];
    const nameRU = selectedChef?.dataset.ru || '— Не выбрано —';
    const nameEN = selectedChef?.dataset.en || '— Not selected —';
    const nameLine = currentLang === 'en'
      ? `👨‍🍳 Name: ${nameEN}`
      : `👨‍🍳 Имя: ${nameRU}`;
    message += `${nameLine}\n\n`;

    // Разделы
    document.querySelectorAll('.menu-section').forEach(section => {
      const sectionTitle = section.querySelector('.section-title');
      const titleRU = sectionTitle?.dataset.ru || '';
      const titleEN = sectionTitle?.dataset.en || '';
      const sectionLine = currentLang === 'en'
        ? `🔸 <b>${titleEN}</b>\n`
        : `🔸 <b>${titleRU}</b>\n`;
      message += sectionLine;

      // Все блюда в разделе
      const dishBlocks = section.querySelectorAll('.dish');
      dishBlocks.forEach(dish => {
        const select = dish.querySelector('select.qty');
        const label = dish.querySelector('label.check-label');

        if (select && label) {
          const labelRU = select.dataset.labelRu || label.dataset.ru || '';
          const labelEN = select.dataset.labelEn || label.dataset.en || '';
          const selectedOption = select.options[select.selectedIndex];

          const valueRU = selectedOption?.dataset.ru || '— Не выбрано —';
          const valueEN = selectedOption?.dataset.en || '— Not selected —';

          message += `• ${labelRU} / ${labelEN}: ${valueRU} / ${valueEN}\n`;
        }
      });

      // Комментарий после раздела
      const nextBlock = section.nextElementSibling;
      const commentField = nextBlock?.querySelector('textarea.comment');
      if (commentField && commentField.value.trim()) {
        const commentText = commentField.value.trim();
        message += `💬 ${currentLang === 'en' ? 'Comment' : 'Комментарий'}: ${commentText}\n`;
      }

      message += `\n`;
    });

    // === Отправка в Telegram ===
    const token = '8348920386:AAFlufZWkWqsH4-qoqSSHdmgcEM_s46Ke8Q';
    const chat_id = '-1002393080811';

    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id,
        text: message,
        parse_mode: 'HTML'
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        alert('✅ Чеклист отправлен!');
        localStorage.clear(); // ← сброс ТОЛЬКО при успешной отправке
      } else {
        alert('❌ Ошибка при отправке в Telegram');
      }
    })
    .catch(err => {
      alert('❌ Ошибка подключения к Telegram');
      console.error(err);
    });
  });
});