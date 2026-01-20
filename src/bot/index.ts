import type { Env } from "../types";
import { sendMessage } from "./telegram";
import { handleCommand } from "./commands";

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

  if (text.startsWith("/")) {
    await handleCommand(text, chatId, message, env);
    return;
  }

  await sendMessage(env.TELEGRAM_TOKEN, chatId, `PONG: ${text}`);
}
