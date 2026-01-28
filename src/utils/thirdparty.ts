import { buildUrl } from "./helper";
import OpenAI from "openai";

export class HTTPError extends Error {
  status: number;
  body: any;
  constructor(status: number, body: any, message?: string) {
    super(message || `HTTP ${status}`);
    this.status = status;
    this.body = body;
    Object.setPrototypeOf(this, HTTPError.prototype);
  }
}

export interface PrayerJadwalDay {
  tanggal?: string;
  imsak?: string;
  subuh?: string;
  terbit?: string;
  dhuha?: string;
  dzuhur?: string;
  ashar?: string;
  maghrib?: string;
  isya?: string;
  [k: string]: any;
}

export interface PrayerData {
  id: string;
  kabko?: string;
  prov?: string;
  jadwal: Record<string, PrayerJadwalDay>;
}

export interface PrayerApiResponse {
  status: boolean;
  message?: string;
  data?: PrayerData;
}

export const fetchJson = async (url: string): Promise<any> => {
  try {
    const res = await fetch(url);
    const text = await res.text().catch(() => "");
    let json: any;
    try {
      json = text ? JSON.parse(text) : null;
    } catch (err) {
      json = text;
    }

    if (!res.ok) {
      throw new HTTPError(res.status, json, `Request failed ${res.status}`);
    }

    return json;
  } catch (err: any) {
    if (err instanceof HTTPError) throw err;
    throw new Error(`Network error: ${err?.message ?? String(err)}`);
  }
};

export const fetchPrayerSchedule = async (
  baseUrl: string | undefined,
  cityCode: string,
): Promise<PrayerApiResponse> => {
  if (!baseUrl) throw new Error("PRAYER_API_BASE_URL not configured");
  const url = buildUrl(baseUrl, cityCode);
  return fetchJson(url) as Promise<PrayerApiResponse>;
};

export interface WeatherLocation {
  adm1?: string;
  adm2?: string;
  adm3?: string;
  adm4?: string;
  provinsi?: string;
  kotkab?: string;
  kecamatan?: string;
  desa?: string;
  lon?: number;
  lat?: number;
  timezone?: string;
  [k: string]: any;
}

export interface WeatherEntry {
  datetime?: string;
  local_datetime?: string;
  t?: number;
  weather_desc?: string;
  hu?: number;
  image?: string;
  [k: string]: any;
}

export interface WeatherDataItem {
  lokasi: WeatherLocation & { type?: string };
  cuaca: WeatherEntry[][];
}

export interface WeatherApiResponse {
  lokasi?: WeatherLocation;
  data?: WeatherDataItem[];
}

export const fetchWeatherSchedule = async (
  baseUrl: string | undefined,
  adm4Code: string
): Promise<WeatherApiResponse> => {
  if (!baseUrl) throw new Error("WEATHER_API_BASE_URL not configured");
  const url = buildUrl(baseUrl, adm4Code);
  return fetchJson(url) as Promise<WeatherApiResponse>;
};

export const generateDailyMotivation = async (apiKey: string): Promise<string> => {
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const client = new OpenAI({ apiKey });

  const prompt = `
Kamu adalah seorang motivator yang ahli dalam membuat satu kalimat motivasi yang kuat, singkat, dan inspiratif.

Instruksi:
- Buat hanya **1 kalimat motivasi** yang langsung kuat dan to the point.
- Nada: hangat, percaya diri, positif, dan menyemangati.
- Jangan fokus hanya pada pagi atau bangun tidur — buat kalimat yang bisa memberi semangat kapan saja.
- Pastikan setiap output selalu unik dan kreatif dari hari ke hari.

Format output:
“Kalimat motivasi yang kuat dan unik”

Sekarang buat satu kalimat motivasi yang penuh semangat.`;

  try {
    const res: any = await client.chat.completions.create({
      model: "gpt-5-nano",
      messages: [{ role: "user", content: prompt }],
    });

    const text = res?.choices?.[0]?.message?.content;
    if (!text) throw new Error("No response from OpenAI");
    return String(text).trim();
  } catch (err: any) {
    throw new Error(`OpenAI error: ${err?.message ?? String(err)}`);
  }
};