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

// === Сохранение и восстановление данных формы ===
function saveFormData() {
  const data = {};
  document.querySelectorAll('select').forEach(select => {
    data[select.name || select.id] = select.value;
  });
  document.querySelectorAll('textarea.comment').forEach(textarea => {
    data[textarea.name || textarea.id] = textarea.value;
  });
  localStorage.setItem('formData', JSON.stringify(data));
}

function restoreFormData() {
  const saved = localStorage.getItem('formData');
  if (!saved) return;
  const data = JSON.parse(saved);
  document.querySelectorAll('select').forEach(select => {
    if (data[select.name || select.id] !== undefined) {
      select.value = data[select.name || select.id];
    }
  });
  document.querySelectorAll('textarea.comment').forEach(textarea => {
    if (data[textarea.name || textarea.id] !== undefined) {
      textarea.value = data[textarea.name || textarea.id];
    }
  });
}

// === DOMContentLoaded ===
document.addEventListener('DOMContentLoaded', () => {
  const lang = document.documentElement.lang || 'ru';

  // Вставка пустой опции в каждый select.qty
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
    }
  });

  // Восстановление данных формы
  restoreFormData();

  // Применение языка
  switchLanguage(lang);

  // Вставка текущей даты
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const formattedDate = `${day}/${month}`;
  const dateDiv = document.getElementById('autodate');
  if (dateDiv) dateDiv.textContent = formattedDate;

  // Автосохранение при изменениях
  document.querySelectorAll('select, textarea.comment').forEach(el => {
    el.addEventListener('input', saveFormData);
  });

  // === Отправка в Telegram ===
  const button = document.getElementById('sendToTelegram');
  button.addEventListener('click', () => {
    const buildMessage = (lang) => {
      let message = `🧾 <b>${lang === 'en' ? 'Checklist' : 'Чеклист'}</b>\n\n`;

      message += `📅 ${lang === 'en' ? 'Date' : 'Дата'}: ${formattedDate}\n`;

      const nameSelect = document.querySelector('select[name="chef"]');
      const selectedChef = nameSelect?.options[nameSelect.selectedIndex];
      const name = selectedChef?.dataset[lang] || '—';
      message += `${lang === 'en' ? '👨‍🍳 Name' : '👨‍🍳 Имя'}: ${name}\n\n`;

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

    const sendSplitMessage = async (msg) => {
      const maxLength = 4096;
      const parts = [];

      for (let i = 0; i < msg.length; i += maxLength) {
        parts.push(msg.substring(i, i + maxLength));
      }

      for (const part of parts) {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id, text: part, parse_mode: 'HTML' })
        });

        const data = await res.json();
        if (!data.ok) throw new Error(data.description);
      }
    };

    Promise.resolve()
      .then(() => sendSplitMessage(messageRU))
      .then(() => sendSplitMessage(messageEN))
      .then(() => {
        alert('✅ Чеклист отправлен!');
        localStorage.clear();
      })
      .catch(err => {
        alert('❌ Ошибка при отправке: ' + err.message);
        console.error(err);
      });
  });
});