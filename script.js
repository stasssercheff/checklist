document.addEventListener('DOMContentLoaded', () => {
  const token = '8348920386:AAFlufZWkWqsH4-qoqSSHdmgcEM_s46Ke8Q';
  const chat_id = '-1002393080811';

  const button = document.getElementById('sendToTelegram');
  button.addEventListener('click', () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const formattedDate = `${day}/${month}`;

    const nameSelect = document.querySelector('select[name="chef"]');
    const selectedChef = nameSelect?.options[nameSelect.selectedIndex];
    const nameRU = selectedChef?.dataset.ru || '— Не выбрано —';
    const nameEN = selectedChef?.dataset.en || '— Not selected —';

    // === Формирование сообщений ===
    let messageRU = `🧾 <b>Чеклист</b>\n\n📅 Дата: ${formattedDate}\n👨‍🍳 Имя: ${nameRU}\n\n`;
    let messageEN = `🧾 <b>Checklist</b>\n\n📅 Date: ${formattedDate}\n👨‍🍳 Name: ${nameEN}\n\n`;

    document.querySelectorAll('.menu-section').forEach(section => {
      const titleRU = section.querySelector('.section-title')?.dataset.ru || '';
      const titleEN = section.querySelector('.section-title')?.dataset.en || '';
      messageRU += `🔸 <b>${titleRU}</b>\n`;
      messageEN += `🔸 <b>${titleEN}</b>\n`;

      section.querySelectorAll('.dish').forEach(dish => {
        const select = dish.querySelector('select.qty');
        const label = dish.querySelector('label.check-label');
        if (select && label) {
          const labelRU = select.dataset.labelRu || label.dataset.ru || '';
          const labelEN = select.dataset.labelEn || label.dataset.en || '';
          const selectedOption = select.options[select.selectedIndex];
          const valueRU = selectedOption?.dataset.ru || '— Не выбрано —';
          const valueEN = selectedOption?.dataset.en || '— Not selected —';

          messageRU += `• ${labelRU}: ${valueRU}\n`;
          messageEN += `• ${labelEN}: ${valueEN}\n`;
        }
      });

      const comment = section.nextElementSibling?.querySelector('textarea.comment')?.value.trim();
      if (comment) {
        messageRU += `💬 Комментарий: ${comment}\n`;
        messageEN += `💬 Comment: ${comment}\n`;
      }

      messageRU += '\n';
      messageEN += '\n';
    });

    // === Отправка на русском ===
    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id,
        text: messageRU,
        parse_mode: 'HTML'
      })
    })
    .then(res => res.json())
    .then(data => {
      if (!data.ok) {
        alert('❌ Ошибка при отправке на русском:\n' + JSON.stringify(data, null, 2));
      } else {
        // === Отправка на английском после успеха русской ===
        return fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id,
            text: messageEN,
            parse_mode: 'HTML'
          })
        });
      }
    })
    .then(res => res?.json?.())
    .then(data => {
      if (data && !data.ok) {
        alert('❌ Ошибка при отправке на английском:\n' + JSON.stringify(data, null, 2));
      } else if (data) {
        alert('✅ Чеклист отправлен на русском и английском!');
      }
    })
    .catch(err => {
      alert('❌ Ошибка подключения к Telegram');
      console.error(err);
    });
  });
});