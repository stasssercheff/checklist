document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form') || document.body;
  const button = document.createElement('button');
  button.textContent = 'Отправить в Telegram';
  button.style.marginTop = '30px';
  button.style.padding = '12px 20px';
  button.style.fontSize = '18px';
  form.appendChild(button);

  button.addEventListener('click', () => {
    const selects = document.querySelectorAll('select');
    const lang = document.documentElement.lang || 'ru';

    let message = `🧾 <b>Чеклист</b>\n\n`;

    selects.forEach(select => {
      const labelRU = select.dataset.labelRu;
      const labelEN = select.dataset.labelEn;
      const selected = select.options[select.selectedIndex];

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