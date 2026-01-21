import type { Env } from "../types";
import { sendMessage, sendMessageWithButton } from "./telegram";
import type { TelegramUpdate } from "./index";
import { userQueries } from "../db/users";

type CommandHandler = (
  chatId: number,
  message: TelegramUpdate["message"],
  env: Env["Bindings"]
) => Promise<void>;

const commands: Record<string, CommandHandler> = {
  "/start": async (chatId, message, env) => {
    const tgId = String(message?.from?.id ?? chatId);
    const name = message?.from?.first_name ?? "Bro";

    let user = await userQueries.getByTelegramId(env.DB, tgId);

    const genAndStore = async () => {
      const apiKey = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      await userQueries.setApiKey(env.DB, tgId, apiKey, createdAt);
      return apiKey;
    };

    let apiKeyToUse: string | null = null;

    if (!user) {
      await userQueries.create(env.DB, name, tgId);
      apiKeyToUse = await genAndStore();
    } else {
      if (user.api_key && user.api_key_created_at) {
        const created = Date.parse(user.api_key_created_at as string);
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        if (!isNaN(created) && now - created <= oneDay) {
          apiKeyToUse = user.api_key as string;
        }
      }
      if (!apiKeyToUse) apiKeyToUse = await genAndStore();
    }

    const frontend = env.FRONTEND_URL;
    const link = `${frontend}?ref=${encodeURIComponent(apiKeyToUse)}`;

    await sendMessageWithButton(
      env.TELEGRAM_TOKEN,
      chatId,
      `Yo ${name} 👋 Welcome! Klik tombol di bawah buat mulai atur preferensi lu.`,
      "🚀 Go",
      link
    );
  },

  "/help": async (chatId, _message, env) => {
    const helpText = `tanya sini ae bro @brogrammerID klo bingung`.trim();
    await sendMessage(env.TELEGRAM_TOKEN, chatId, helpText);
  },
};

export async function handleCommand(
  text: string | undefined,
  chatId: number,
  message: TelegramUpdate["message"],
  env: Env["Bindings"]
) {
  if (!text) {
    await sendMessage(env.TELEGRAM_TOKEN, chatId, "Hah kosong?");
    return;
  }
  const textSafe = text ?? "";
  const textSplit = textSafe.split(" ");
  const firstWord = (textSplit[0] ?? "").toLowerCase();
  const command = firstWord;
  const handler = commands[command];

  if (handler) {
    await handler(chatId, message, env);
  } else {
    await sendMessage(env.TELEGRAM_TOKEN, chatId, "Command-nya belum ada bro coba /help aja.");
  }
}
