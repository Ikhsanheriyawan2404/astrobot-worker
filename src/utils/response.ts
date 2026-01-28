import type { Context } from "hono";
import type { StatusCode } from "hono/utils/http-status";

export const success = (c: Context, data: any, message?: string) => {
  return c.json({ data, message }, 200);
};

export const error = (c: Context, message: string, status: StatusCode) => {
  c.status(status);
  return c.json({ message });
};

export const buildResponseTodos = (
  rows: { title: string }[]
): string => {
  if (!rows || rows.length === 0) {
    return `<b>Belum ada todos nih, coba buat dulu di halaman utama.</b>`
  }

  const list = rows
    .map(r => `• ${r.title}`)
    .join('\n')

  const text = `<b>Ini daftar Todos kamu:</b>\n${list}`

  return text
}

export const buildResponseWeather = (
  header: string,
  segments: string[],
  source = "data.bmkg.go.id"
) => {
  const lines = [header, ...segments, "", `Sumber: BMKG — ${source}`];
  return lines.join("\n");
};

export const buildResponsePrayer = (
  kabko: string | undefined,
  prov: string | undefined,
  today: any,
  id?: string
) => {
  const lines = [
    `<b>Jadwal Sholat — ${kabko || "-"}, ${prov || "-"}</b>`,
    `${today?.tanggal || "-"}`,
    "",
    `Imsak: ${today?.imsak || "-"}`,
    `Subuh: ${today?.subuh || "-"}`,
    `Terbit: ${today?.terbit || "-"}`,
    `Dhuha: ${today?.dhuha || "-"}`,
    `Dzuhur: ${today?.dzuhur || "-"}`,
    `Ashar: ${today?.ashar || "-"}`,
    `Maghrib: ${today?.maghrib || "-"}`,
    `Isya: ${today?.isya || "-"}`,
    "",
    `ID: ${id || "-"}`,
    `Sumber: myquran.com`
  ];

  return lines.join("\n");
};
