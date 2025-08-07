// === Переключение языка ===
function switchLanguage(lang) {
  document.documentElement.lang = lang;

  // Заголовки разделов
  document.querySelectorAll('.section-title').forEach(title => {
    if (title.dataset[lang]) {
      title.textContent = title.dataset[lang];
    }
  });

  // Метки (label)
  document.querySelectorAll('.check-label').forEach(label => {
    if (label.dataset[lang]) {
      label.textContent = label.dataset[lang];
    }
  });

  // Опции в селекторах
  document.querySelectorAll('select').forEach(select => {
    Array.from(select.options).forEach(option => {
      if (option.dataset[lang]) {
        option.textContent = option.dataset[lang];
      }
    });
  });
}

// === После загрузки документа ===
document.addEventListener('DOMContentLoaded', () => {
  // === Принудительно вставляем пустую опцию в каждый select.qty
  document.querySelectorAll('select.qty').forEach(select => {
    const hasEmptyOption = Array.from(select.options).some(opt => opt.value === '');

    if (!hasEmptyOption) {
      const emptyOption = document.createElement('option');
      emptyOption.value = '';
      emptyOption.dataset.ru = '— Выбрать —';
      emptyOption.dataset.en = '— Select —';
      emptyOption.textContent = document.documentElement.lang === 'en' ? '— Select —' : '— Выбрать —';
      select.insertBefore(emptyOption, select.firstChild);

      // Принудительно выбрать пустую опцию как активную
      select.selectedIndex = 0;
    }
  });

  // Применяем язык ко всем элементам при загрузке
  const currentLang = document.documentElement.lang || 'ru';
  switchLanguage(currentLang);

  // === Обработчик кнопки отправки в Telegram ===
  const tgButton = document.getElementById('sendToTelegram');
  if (tgButton) {
    tgButton.addEventListener('click', () => {
      const selects = document.querySelectorAll('select.qty');
      const lang = document.documentElement.lang || 'ru';

      let message = `🧾 <b>Чеклист</b>\n\n`;

      selects.forEach(select => {
        const selected = select.options[select.selectedIndex];
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
  }
});