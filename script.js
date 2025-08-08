function sendLongMessage(text, token, chat_id) {
  const chunks = [];
  while (text.length > 0) {
    chunks.push(text.slice(0, 4000));
    text = text.slice(4000);
  }

  return chunks.reduce((promise, chunk) => {
    return promise.then(() => {
      return fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id,
          text: chunk,
          parse_mode: 'HTML'
        })
      }).then(res => res.json()).then(data => {
        if (!data.ok) throw new Error(data.description);
      });
    });
  }, Promise.resolve());
}