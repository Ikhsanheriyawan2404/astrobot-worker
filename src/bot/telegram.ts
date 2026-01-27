const TELEGRAM_API = "https://api.telegram.org/bot";

export async function sendMessage(token: string, chatId: number, text: string) {
  const url = `${TELEGRAM_API}${token}/sendMessage`;
  
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });
}

export async function sendMessageWithButton(token: string, chatId: number, text: string, buttonText: string, buttonUrl: string) {
  const url = `${TELEGRAM_API}${token}/sendMessage`;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: buttonText, url: buttonUrl }]],
      },
    }),
  });
}

export async function sendMessageWithKeyboardButton(token: string, chatId: number, text: string) {
  const url = `${TELEGRAM_API}${token}/sendMessage`;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_markup: {
        keyboard: [
          [
            { text: '⚙️ Setting' },
            { text: '📝 Todos' }
          ],
          [
            { text: '🌤️ Cuaca' },
            { text: '🕌 Sholat' }
          ]
        ],
        resize_keyboard: true,
        one_time_keyboard: false,
      },
    }),
  });
}

export async function setWebhook(token: string, webhookUrl: string) {
  const url = `${TELEGRAM_API}${token}/setWebhook`;
  
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: webhookUrl }),
  });

  return res.json();
}
