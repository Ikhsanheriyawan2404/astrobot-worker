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

export async function setWebhook(token: string, webhookUrl: string) {
  const url = `${TELEGRAM_API}${token}/setWebhook`;
  
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: webhookUrl }),
  });

  return res.json();
}
