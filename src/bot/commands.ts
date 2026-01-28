import type { Env } from "../types";
import { sendMessage, sendMessageWithButton, sendMessageWithKeyboardButton } from "./telegram";
import type { TelegramUpdate } from "./index";
import { userQueries } from "../db/users";
import { todoQueries } from "../db/todos";
import { buildResponseTodos, buildResponseWeather, buildResponsePrayer } from "../utils/response";
import { fetchPrayerSchedule, type PrayerApiResponse, type PrayerData, fetchWeatherSchedule, type WeatherApiResponse, type WeatherDataItem, type WeatherEntry } from "../utils/thirdparty";
import { callPrayerApi, callWeatherApi } from "../utils/apiQueue";

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

      const wRes: WeatherApiResponse = await callWeatherApi(() => fetchWeatherSchedule(env.WEATHER_API_BASE_URL, prefs.weather_adm4 as string));

      if (!wRes || !wRes.data || wRes.data.length === 0) {
        console.error('Invalid weather API response', wRes);
        await sendMessage(env.TELEGRAM_TOKEN, chatId, 'Gagal ambil data cuaca, coba lagi nanti.');
        return;
      }

      const dayItem: WeatherDataItem = wRes.data[0] as WeatherDataItem;
      const slices = dayItem.cuaca || [];
      const entries: WeatherEntry[] = ([] as WeatherEntry[]).concat(...slices);

      if (!entries || entries.length === 0) {
        await sendMessage(env.TELEGRAM_TOKEN, chatId, 'Data cuaca untuk hari ini tidak tersedia.');
        return;
      }

      const first = entries[0]!;
      const datePart = (first.local_datetime || first.datetime || first.utc_datetime || "").toString().split(" ")[0].split("T")[0];
      let header = datePart || "-";
      try {
        if (datePart) {
          const d = new Date(datePart + 'T00:00:00');
          header = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: '2-digit', month: 'short' }).format(d);
        }
      } catch (e) { /*ignore formatting errors */ }

      const emojiFor = (desc?: string) => {
        const s = (desc || '').toLowerCase();
        if (s.includes('hujan')) return s.includes('ringan') ? '🌦' : '🌧';
        if (s.includes('cerah') && s.includes('berawan')) return '⛅️';
        if (s.includes('cerah')) return '☀️';
        if (s.includes('berawan')) return '☁️';
        return '🌥';
      };

      const targetDate = datePart;
      const dayEntries = entries.filter(e => {
        const d = (e.local_datetime || e.datetime || e.utc_datetime || '').toString().split(' ')[0].split('T')[0];
        return d === targetDate;
      });

      const sourceEntries = (dayEntries && dayEntries.length) ? dayEntries : entries;
      sourceEntries.sort((a,b) => {
        const ta = new Date((a.local_datetime || a.datetime || a.utc_datetime || '')).getTime();
        const tb = new Date((b.local_datetime || b.datetime || b.utc_datetime || '')).getTime();
        return (ta || 0) - (tb || 0);
      });

      const segments = sourceEntries.map(e => {
        const local = (e.local_datetime || e.utc_datetime || e.datetime || '').toString();
        const timePart = (local.split(' ')[1] || local.split('T')[1] || '').slice(0,5);
        const timeLabel = timePart ? timePart.replace(':', '.') : '-';
        const emoji = emojiFor(e.weather_desc || e.weather_desc_en);
        const temp = (typeof e.t === 'number') ? `${Math.round(e.t)}°C` : '-';
        return `${timeLabel} ${emoji} ${temp}`;
      });

      const text = buildResponseWeather(header, segments);
      await sendMessage(env.TELEGRAM_TOKEN, chatId, text);
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

      try {
        const apiRes: PrayerApiResponse = await callPrayerApi(() => fetchPrayerSchedule(env.PRAYER_API_BASE_URL, prefs.prayer_city_code as string));

        if (!apiRes || apiRes.status !== true || !apiRes.data) {
          console.error('Invalid prayer API response', apiRes);
          await sendMessage(env.TELEGRAM_TOKEN, chatId, 'Gagal ambil jadwal sholat, coba lagi nanti.');
          return;
        }

        const data: PrayerData = apiRes.data;
        console.log({data})
        const { kabko, prov, jadwal } = data;
        const dayKey = Object.keys(jadwal || {})[0];
        const today = jadwal?.[dayKey!] || {};

        const text = buildResponsePrayer(kabko, prov, today, data.id);
        await sendMessage(env.TELEGRAM_TOKEN, chatId, text);
      } catch (err: any) {
        console.error('Error fetching prayer schedule:', err);
        if (err?.status) {
          await sendMessage(env.TELEGRAM_TOKEN, chatId, `Gagal ambil jadwal sholat (code ${err.status}).`);
        } else {
          await sendMessage(env.TELEGRAM_TOKEN, chatId, 'Gagal ambil jadwal sholat dari API, coba lagi nanti.');
        }
      }
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
