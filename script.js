// === Переключение языка ===
function switchLanguage(lang) {
  // Меняем язык у всех меток
  document.querySelectorAll('.check-label').forEach(label => {
    if (label.dataset[lang]) {
      label.textContent = label.dataset[lang];
    }
  });

  // Меняем язык у названий разделов
  document.querySelectorAll('.section-title').forEach(title => {
    if (title.dataset[lang]) {
      title.textContent = title.dataset[lang];
    }
  });

  // Меняем язык у опций в селекторах
  document.querySelectorAll('select').forEach(select => {
    Array.from(select.options).forEach(opt => {
      if (opt.dataset[lang]) {
        opt.textContent = opt.dataset[lang];
      }
    });
  });
}

// === Отправка в Telegram ===
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form') || document.body;

  const button = document.createElement('button');
  button.textContent = 'Отправить в Telegram';
  button.className = 'send-button';
  form.appendChild(button);

  button.addEventListener('click', () => {
    const selects = document.querySelectorAll('select');
    const lang = document.documentElement.lang || 'ru';

    let message = `🧾 <b>Чеклист</b>\n\n`;

    selects.forEach(select => {
      const selected = select.options[select.selectedIndex];

      // Пропускаем, если ничего не выбрано
      if (!selected || selected.value === '') return;

      const labelRU = select.dataset.labelRu;
      const labelEN = select.dataset.labelEn;

      const valueRU = selected.dataset.ru || selected.textContent;
      const valueEN = selected.dataset.en || selected.textContent;

      if (labelRU && labelEN) {
        message += `• ${labelRU} / ${labelEN}: ${valueRU} / ${valueEN}\n`;
      }
    });

    const token = '8348920386:AAFlufZWkWqsH4-qoqSSHdmgcEM_s46Ke8Q';
    const chat_id = '-1002393080811';

    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat_id,
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