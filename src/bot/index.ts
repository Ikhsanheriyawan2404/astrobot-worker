import type { Env } from "../types";
import { sendMessage } from "./telegram";
import { handleCommand } from "./commands";
import { todoQueries } from "../db/todos";

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text?: string;
    date: number;
  };
}

export async function handleUpdate(update: TelegramUpdate, env: Env["Bindings"]) {
  const message = update.message;
  if (!message || !message.text) return;

  const chatId = message.chat.id;
  const text = message.text;

  try {
    if (text.startsWith("/")) {
      await handleCommand(text, chatId, message, env);
      return;
    }

    if (text === '⚙️ Setting') {
      await handleCommand('/settings', chatId, message, env);
      return;
    }

    if (text === '📝 Todos') {
      await handleCommand('/todos', chatId, message, env);
      return;
    }
    
    if (text === '🌤️ Cuaca') {
      await handleCommand('/cuaca', chatId, message, env);
      return;
    }
    
    if (text === '🕌 Sholat') {
      await handleCommand('/sholat', chatId, message, env);
      return;
    }

    await todoQueries.saveMyTodo(env.DB, String(chatId), text);

    const textMessage = `Todo-nya udah gw bantu catet ya`;
    const botResponse = `${textMessage}\n<i>${text}</i>`;

    await sendMessage(env.TELEGRAM_TOKEN, chatId, botResponse);
  } catch (error) {
    console.error("Error handling update:", error);
    await sendMessage(env.TELEGRAM_TOKEN, chatId, "Maaf, terjadi kesalahan saat memproses permintaan Anda.");
    return;
  }
}
