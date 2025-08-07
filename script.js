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
      if (option.value === '') {
        option.textContent = '—';
      } else if (option.dataset[lang]) {
        option.textContent = option.dataset[lang];
      }
    });
  });
}

// === DOMContentLoaded ===
document.addEventListener('DOMContentLoaded', () => {
  const lang = document.documentElement.lang || 'ru';

  // Вставка пустой опции в каждый select.qty, если её нет
  document.querySelectorAll('select.qty').forEach(select => {
    const hasEmpty = Array.from(select.options).some(opt => opt.value === '');
    if (!hasEmpty) {
      const emptyOption = document.createElement('option');
      emptyOption.value = '';
      emptyOption.dataset.ru = '—';
      emptyOption.dataset.en = '—';
      emptyOption.textContent = '—';
      emptyOption.selected = true;
      select.insertBefore(emptyOption, select.firstChild);
    } else {
      select.value = '';
    }
  });

  // Применить язык после вставки опций
  switchLanguage(lang);

  // === Вставка текущей даты ===
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const formattedDate = `${day}/${month}`;
  const dateDiv = document.getElementById('autodate');
  if (dateDiv) dateDiv.textContent = formattedDate;

  // === Отправка в Telegram (на 2 языках) ===
  const button = document.getElementById('sendToTelegram');
  button.addEventListener('click', () => {
    const buildMessage = (lang) => {
      let message = `🧾 <b>${lang === 'en' ? 'Checklist' : 'Чеклист'}</b>\n\n`;

      // Дата
      message += `📅 ${lang === 'en' ? 'Date' : 'Дата'}: ${formattedDate}\n`;

      // Имя
      const nameSelect = document.querySelector('select[name="chef"]');
      const selectedChef = nameSelect?.options[nameSelect.selectedIndex];
      const name = selectedChef?.dataset[lang] || '—';
      message += `${lang === 'en' ? '👨‍🍳 Name' : '👨‍🍳 Имя'}: ${name}\n\n`;

      // Разделы
      document.querySelectorAll('.menu-section').forEach(section => {
        const sectionTitle = section.querySelector('.section-title');
        const title = sectionTitle?.dataset[lang] || '';
        message += `🔸 <b>${title}</b>\n`;

        section.querySelectorAll('.dish').forEach(dish => {
          const select = dish.querySelector('select.qty');
          const label = dish.querySelector('label.check-label');
          const labelText = select.dataset[`label${lang.toUpperCase()}`] || label.dataset[lang] || '';
          const selectedOption = select.options[select.selectedIndex];
          const value = selectedOption?.dataset[lang] || '—';

          message += `• ${labelText}: ${value}\n`;
        });

        const nextBlock = section.nextElementSibling;
        const commentField = nextBlock?.querySelector('textarea.comment');
        if (commentField && commentField.value.trim()) {
          message += `💬 ${lang === 'en' ? 'Comment' : 'Комментарий'}: ${commentField.value.trim()}\n`;
        }

        message += `\n`;
      });

      return message;
    };

    const token = '8348920386:AAFlufZWkWqsH4-qoqSSHdmgcEM_s46Ke8Q';
    const chat_id = '-1002393080811';
    const messageRU = buildMessage('ru');
    const messageEN = buildMessage('en');

    const sendMessage = (msg) => {
      return fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id,
          text: msg,
          parse_mode: 'HTML'
        })
      }).then(res => res.json());
    };

    // Отправка обоих сообщений по очереди
    sendMessage(messageRU)
      .then(data1 => {
        if (!data1.ok) throw new Error(data1.description);
        return sendMessage(messageEN);
      })
      .then(data2 => {
        if (!data2.ok) throw new Error(data2.description);
        alert('✅ Чеклист отправлен!');
        // localStorage.clear(); // Можно раскомментировать при необходимости
      })
      .catch(err => {
        alert('❌ Ошибка при отправке: ' + err.message);
        console.error(err);
      });
  });
});