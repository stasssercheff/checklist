// === Переключение языка ===
function switchLanguage(lang) {
  document.documentElement.lang = lang;

  // Заголовки разделов
  document.querySelectorAll('.section-title').forEach(title => {
    if (title.dataset[lang]) {
      title.textContent = title.dataset[lang];
    }
  });

  // Метки
  document.querySelectorAll('.check-label').forEach(label => {
    if (label.dataset[lang]) {
      label.textContent = label.dataset[lang];
    }
  });

  // Опции селекторов
  document.querySelectorAll('select').forEach(select => {
    Array.from(select.options).forEach(option => {
      if (option.dataset[lang]) {
        option.textContent = option.dataset[lang];
      }
    });
  });

  // Обновить текст пустых опций
  document.querySelectorAll('select.qty').forEach(select => {
    const emptyOption = select.querySelector('option[value=""]');
    if (emptyOption) {
      emptyOption.textContent = lang === 'en' ? '— Select —' : '— Выбрать —';
    }
  });
}

// === DOMContentLoaded ===
document.addEventListener('DOMContentLoaded', () => {
  const lang = document.documentElement.lang || 'ru';

  // Вставка пустой опции во все select.qty
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

  // Применить язык после добавления опций
  switchLanguage(lang);

  // Обработка кнопки
  const button = document.getElementById('sendToTelegram');
  button.addEventListener('click', () => {
    const lang = document.documentElement.lang || 'ru';
    let message = `🧾 <b>Чеклист</b>\n\n`;

    // === Дата ===
    const day = document.querySelector('select[name="day"]')?.value || '—';
    const month = document.querySelector('select[name="month"]')?.value || '—';
    const dateLine = lang === 'en' ? `📅 Date: ${day}/${month}` : `📅 Дата: ${day}/${month}`;
    message += `${dateLine}\n`;

    // === Имя ===
    const nameSelect = document.querySelector('select[name="chef"]');
    const selectedChef = nameSelect?.options[nameSelect.selectedIndex];
    const nameLine = lang === 'en' 
      ? `👨‍🍳 Name: ${(selectedChef?.dataset.en || '— Not selected —')}`
      : `👨‍🍳 Имя: ${(selectedChef?.dataset.ru || '— Не выбрано —')}`;
    message += `${nameLine}\n\n`;

    // === Все разделы ===
    document.querySelectorAll('.menu-section').forEach(section => {
      const sectionTitle = section.querySelector('.section-title');
      const title = sectionTitle?.dataset[lang] || sectionTitle?.textContent || '';

      message += `🔸 <b>${title}</b>\n`;

      // Все .dish внутри
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

      // === Комментарий ===
      const comment = section.nextElementSibling?.querySelector('textarea.comment');
      if (comment && comment.value.trim()) {
        message += `💬 ${lang === 'en' ? 'Comment' : 'Комментарий'}: ${comment.value.trim()}\n`;
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