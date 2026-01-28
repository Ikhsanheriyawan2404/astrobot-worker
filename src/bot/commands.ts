import type { Env } from "../types";
import { sendMessage, sendMessageWithButton, sendMessageWithKeyboardButton } from "./telegram";
import type { TelegramUpdate } from "./index";
import { userQueries } from "../db/users";
import { todoQueries } from "../db/todos";
import { buildResponseTodos } from "../utils/response";

type CommandHandler = (
  chatId: number,
  message: TelegramUpdate["message"],
  env: Env["Bindings"]
) => Promise<void>;

const commands: Record<string, CommandHandler> = {
  "/start": async (chatId, message, env) => {
    const tgId = String(message?.from?.id ?? chatId);
    const name = message?.from?.first_name ?? "Bro";
    const apiKeyToUse = await generateApiKey(env, tgId, name);
    const frontend = env.FRONTEND_URL;
    const link = `${frontend}?ref=${encodeURIComponent(apiKeyToUse)}`;

    await sendMessageWithKeyboardButton(
      env.TELEGRAM_TOKEN,
      chatId,
      `Yo ${name} 👋 Welcome!`
    )
    await sendMessageWithButton(
      env.TELEGRAM_TOKEN,
      chatId,
      `Klik tombol di bawah buat mulai atur preferensimu.`,
      "🚀 Go",
      link
    );
  },

  "/help": async (chatId, _message, env) => {
    const helpText = `tanya sini ae bro @brogrammerID klo bingung`.trim();
    await sendMessage(env.TELEGRAM_TOKEN, chatId, helpText);
  },
  
  "/settings": async (chatId, message, env) => {
    const tgId = String(message?.from?.id ?? chatId);
    const name = message?.from?.first_name ?? "Bro";
    const apiKeyToUse = await generateApiKey(env, tgId, name);
    const frontend = env.FRONTEND_URL;
    const link = `${frontend}?ref=${encodeURIComponent(apiKeyToUse)}`;
    await sendMessageWithButton(
      env.TELEGRAM_TOKEN,
      chatId,
      `Klik tombol di bawah buat mulai atur preferensimu.`,
      "⚙️ Buka Settings",
      link
    );
  },
  
  "/cuaca": async (chatId, message, env) => {
    const tgId = String(message?.from?.id ?? chatId);
    try {
      const prefs = await userQueries.getNotificationsByTelegramId(env.DB, tgId);
      if (!prefs) throw new Error('No preferences found');
      
      if (!prefs.weather_adm4) {
        await sendMessage(env.TELEGRAM_TOKEN, chatId, 'Lokasi untuk cuaca belum diset di Settings. Silakan pilih lokasi dulu.');
        return;
      }

      await sendMessage(env.TELEGRAM_TOKEN, chatId, `Cuaca handler siap, tapi fetching belum diimplementasi. Kota kode: ${prefs.weather_adm4}`);
    } catch (err) {
      console.error('Error in /cuaca handler:', err);
      await sendMessage(env.TELEGRAM_TOKEN, chatId, 'Gagal cek pengaturan cuaca, coba lagi nanti.');
    }
  },

  "/sholat": async (chatId, message, env) => {
    const tgId = String(message?.from?.id ?? chatId);
    try {
      const prefs = await userQueries.getNotificationsByTelegramId(env.DB, tgId);
      
      if (!prefs) throw new Error('No preferences found');

      if (!prefs.prayer_city_code) {
        await sendMessage(env.TELEGRAM_TOKEN, chatId, 'Lokasi sholat belum diset di Settings. Silakan pilih kota untuk waktu sholat.');
        return;
      }

      await sendMessage(env.TELEGRAM_TOKEN, chatId, `Sholat handler siap, tapi belum fetch jadwal. City code: ${prefs.prayer_city_code}`);
    } catch (err) {
      console.error('Error in /sholat handler:', err);
      await sendMessage(env.TELEGRAM_TOKEN, chatId, 'Gagal cek pengaturan sholat, coba lagi nanti.');
    }
  },

  "/todos": async (chatId, _message, env) => {
    const tgId = String(chatId);
    try {
      const rows = await todoQueries.getMyTodos(env.DB, tgId);
      const text = buildResponseTodos(rows.map(r => ({ title: String(r.title) })));
        
      await sendMessage(env.TELEGRAM_TOKEN, chatId, text);
    } catch (err) {
      console.error('Error fetching todos:', err);
      await sendMessage(env.TELEGRAM_TOKEN, chatId, 'Gagal ambil todos, coba lagi nanti.');
    }
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

export const generateApiKey = async (env: Env["Bindings"], tgId: string, name: string) => {
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
  
  return apiKeyToUse;
}; 
